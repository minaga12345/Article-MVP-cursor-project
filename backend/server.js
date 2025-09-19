const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { YoutubeTranscript } = require('youtube-transcript');
const cheerio = require('cheerio');
const axios = require('axios');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Initialize AI services
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'your-api-key-here'
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAXw1862klCghDYUm46asowU7Iw363bUuc');
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// AI Service selection
const useGemini = process.env.USE_GEMINI === 'true' || process.env.GEMINI_API_KEY;

// Helper function to call AI service
async function callAI(prompt, systemPrompt = null) {
  if (useGemini) {
    try {
      const fullPrompt = systemPrompt ? `${systemPrompt}\n\n${prompt}` : prompt;
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  } else {
    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });
      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }
}

// Store for custom prompts (in production, use a database)
let customPrompts = {
  keyPointsExtraction: `Extract the most important key points from this interview transcript. Focus on:
- Company background and founding story
- Key challenges and solutions
- Metrics and achievements
- Future plans and vision
- Values and principles

Return as JSON array with: text, category, confidence, source`,
  
  draftGeneration: `Write a professional article based on the following:
- Project: {projectName}
- Tone: {tone}
- Angle: {angle}
- Length: {length}
- Key Points: {keyPoints}

Create an engaging article that tells a compelling story while maintaining journalistic integrity.`,
  
  sourceMapping: `Analyze the following article and map each paragraph to its most likely source. Return confidence scores and match types.`
};

// Routes

// Get custom prompts
app.get('/api/prompts', (req, res) => {
  res.json(customPrompts);
});

// Update custom prompts
app.put('/api/prompts', (req, res) => {
  const { keyPointsExtraction, draftGeneration, sourceMapping } = req.body;
  
  if (keyPointsExtraction) customPrompts.keyPointsExtraction = keyPointsExtraction;
  if (draftGeneration) customPrompts.draftGeneration = draftGeneration;
  if (sourceMapping) customPrompts.sourceMapping = sourceMapping;
  
  res.json({ success: true, prompts: customPrompts });
});

// Extract key points using LLM
app.post('/api/extract-key-points', async (req, res) => {
  try {
    const { transcript, sources, customPrompt } = req.body;
    
    const prompt = customPrompt || customPrompts.keyPointsExtraction;
    const fullPrompt = `${prompt}\n\nTranscript:\n${transcript}\n\nSources:\n${JSON.stringify(sources, null, 2)}`;
    
    const systemPrompt = "You are an expert content analyst. Extract key points and return valid JSON only.";
    const response = await callAI(fullPrompt, systemPrompt);
    
    // Try to parse JSON response
    let keyPoints;
    try {
      keyPoints = JSON.parse(response);
    } catch (parseError) {
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        keyPoints = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    }
    
    res.json({ success: true, keyPoints, aiService: useGemini ? 'gemini' : 'openai' });
  } catch (error) {
    console.error('Error extracting key points:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate draft using LLM
app.post('/api/generate-draft', async (req, res) => {
  try {
    const { projectName, tone, angle, length, keyPoints, sources, customPrompt, draftType } = req.body;
    
    let prompt = customPrompt || customPrompts.draftGeneration;
    prompt = prompt
      .replace('{projectName}', projectName)
      .replace('{tone}', tone)
      .replace('{angle}', angle)
      .replace('{length}', length)
      .replace('{keyPoints}', JSON.stringify(keyPoints, null, 2));
    
    const systemPrompt = draftType === 'outline' 
      ? "Create a detailed article outline with clear sections and bullet points."
      : "Write a complete, engaging article that tells a compelling story.";
    
    const draft = await callAI(prompt, systemPrompt);
    
    res.json({ success: true, draft, aiService: useGemini ? 'gemini' : 'openai' });
  } catch (error) {
    console.error('Error generating draft:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process PDF files
app.post('/api/process-pdf', upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No PDF file provided' });
    }
    
    const pdfBuffer = req.file.buffer;
    const data = await pdfParse(pdfBuffer);
    
    res.json({ 
      success: true, 
      content: data.text,
      pages: data.numpages,
      info: data.info
    });
  } catch (error) {
    console.error('Error processing PDF:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process YouTube videos
app.post('/api/process-youtube', async (req, res) => {
  try {
    const { url } = req.body;
    
    // Extract video ID from URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (!videoId) {
      return res.status(400).json({ success: false, error: 'Invalid YouTube URL' });
    }
    
    const transcript = await YoutubeTranscript.fetchTranscript(videoId[1]);
    const text = transcript.map(item => item.text).join(' ');
    
    res.json({ 
      success: true, 
      content: text,
      videoId: videoId[1]
    });
  } catch (error) {
    console.error('Error processing YouTube:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Process web links
app.post('/api/process-web', async (req, res) => {
  try {
    const { url } = req.body;
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    
    // Remove script and style elements
    $('script, style').remove();
    
    // Extract main content
    const title = $('title').text() || $('h1').first().text();
    const content = $('body').text().replace(/\s+/g, ' ').trim();
    
    res.json({ 
      success: true, 
      title: title,
      content: content.substring(0, 10000), // Limit content length
      url: url
    });
  } catch (error) {
    console.error('Error processing web link:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Source mapping and quote verification
app.post('/api/analyze-sources', async (req, res) => {
  try {
    const { draft, sources, customPrompt } = req.body;
    
    const prompt = customPrompt || `Analyze the following article and map each paragraph to its most likely source. Also identify any direct quotes, paraphrases, or key phrases that appear in the sources.
    
    Look for:
    1. Text wrapped in quotes ("..." or '...')
    2. Key phrases that appear in the sources
    3. Paraphrased content from sources
    4. Direct references to source material
    
    Return a JSON object with this exact structure:
    {
      "mappings": [
        {
          "id": "mapping-1",
          "paragraphIndex": 0,
          "paragraphText": "First 100 characters of paragraph...",
          "sourceId": "source1",
          "sourceTitle": "Source Title",
          "confidence": 0.85,
          "matchType": "exact"
        }
      ],
      "quotes": [
        {
          "id": "quote-1",
          "quote": "Exact quoted text or key phrase",
          "sourceId": "source1",
          "sourceTitle": "Source Title",
          "sourceSnippet": "Context around the quote...",
          "matchType": "exact",
          "confidence": 0.95
        }
      ]
    }
    
    Article:\n${draft}\n\nSources:\n${JSON.stringify(sources, null, 2)}`;
    
    const systemPrompt = "You are an expert fact-checker. Analyze the article and return valid JSON only with the exact structure specified.";
    const response = await callAI(prompt, systemPrompt);
    
    // Try to parse JSON response
    let analysis;
    try {
      analysis = JSON.parse(response);
    } catch (parseError) {
      console.log('Raw AI response:', response);
      // If JSON parsing fails, try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (e) {
          console.log('Failed to parse extracted JSON:', jsonMatch[0]);
          // Provide fallback structure
          analysis = {
            mappings: [],
            quotes: []
          };
        }
      } else {
        console.log('No JSON found in response, using fallback');
        // Provide fallback structure
        analysis = {
          mappings: [],
          quotes: []
        };
      }
    }
    
    // Ensure the response has the expected structure
    if (!analysis.mappings) analysis.mappings = [];
    if (!analysis.quotes) analysis.quotes = [];
    
    res.json({ success: true, analysis, aiService: useGemini ? 'gemini' : 'openai' });
  } catch (error) {
    console.error('Error analyzing sources:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    aiService: useGemini ? 'gemini' : 'openai',
    geminiEnabled: useGemini
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server running on port ${PORT}`);
  console.log(`📝 API endpoints available at http://localhost:${PORT}/api`);
});
