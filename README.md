# Article Draft MVP - 24-Hour Low-Code Challenge

A Human-in-the-Loop (HITL) article drafting application that transforms interview transcripts and supporting sources into compelling, well-sourced articles with AI assistance.

## 🎯 Problem Framing & Assumptions

### Problem
Journalists and content creators spend hours manually extracting key points from interview transcripts, mapping content to sources, and verifying quotes. This process is time-consuming, error-prone, and lacks systematic verification of source attribution.

### Assumptions
- **Editor Control**: Human editors need full control over the story direction and content approval
- **Source Integrity**: Every claim must be traceable to its source with confidence scores
- **AI Assistance**: LLMs can accelerate content analysis but require human oversight
- **Flexible Input**: Support for various source types (PDFs, web articles, YouTube transcripts)
- **Export Ready**: Final output should be publication-ready with proper attribution

## 🏗️ Architecture

### Frontend (React + Vite)
```
src/
├── components/
│   ├── ProjectSetup.jsx      # Project creation & source upload
│   ├── KeyPointsExtraction.jsx # AI-powered key point extraction
│   ├── StoryDirection.jsx    # Tone, angle, length configuration
│   ├── DraftGeneration.jsx   # AI article generation
│   ├── SourceMapping.jsx     # Source mapping & quote verification
│   ├── Export.jsx           # Markdown export with provenance
│   └── PromptEditor.jsx     # Editable AI prompts
├── services/
│   └── api.js               # Backend API communication
└── App.jsx                  # Main application state management
```

### Backend (Node.js + Express)
```
backend/
├── server.js               # Express server with AI integration
├── package.json           # Dependencies (Gemini, OpenAI, file processing)
└── .env                   # API keys and configuration
```

### AI Integration
- **Primary**: Google Gemini (free tier)
- **Fallback**: OpenAI GPT-4 (paid)
- **Pattern Matching**: Local fallback when AI is disabled

## 🔄 Core Workflow

### 1. Project Setup
- Create project with name and transcript
- Upload/attach supporting sources (PDF, web, YouTube)
- Process sources to extract text content

### 2. Key Points Extraction
- AI analyzes transcript and sources
- Extracts key points with confidence scores
- Editor can approve, edit, reorder, or add custom points
- Visual indicators for edited/custom points

### 3. Story Direction
- Set tone (professional, casual, technical)
- Choose angle (founder story, technical deep-dive, etc.)
- Configure length (short, medium, long)
- Optional custom instructions

### 4. Draft Generation
- AI generates article based on approved points and direction
- Supports both outline and full draft generation
- Maintains source attribution throughout

### 5. Source Mapping & Quote Verification
- Maps each paragraph to its most likely source
- Identifies and verifies quotes with source context
- Provides confidence scores for all mappings
- Shows source snippets for verification

### 6. Export
- Generates Markdown with proper formatting
- Includes provenance JSON mapping claims to sources
- Ready for publication or further editing

## 🎛️ Key-Point Approval, Source Mapping & Quote Checks

### Key-Point Approval
- **AI Extraction**: LLM analyzes transcript and sources to identify key themes
- **Editor Review**: Human editor can approve, edit, or reject each point
- **Custom Addition**: Editors can add their own key points
- **Reordering**: Drag-and-drop interface for point prioritization
- **Visual Indicators**: Clear marking of edited, custom, and AI-generated points

### Source Mapping
- **Paragraph-Level Mapping**: Each paragraph is mapped to its most likely source
- **Confidence Scoring**: 0-100% confidence for each mapping
- **Match Types**: Exact, partial, or inferred matches
- **Source Context**: Shows relevant source snippets for verification

### Quote Verification
- **Multi-Pattern Detection**: Finds quotes in various formats (`"..."`, `'...'`, etc.)
- **Exact Matching**: Locates quotes in source material
- **Context Provision**: Shows surrounding source text for verification
- **Confidence Scoring**: High confidence for exact matches, lower for paraphrases

## ⚖️ Trade-offs & Future Improvements

### Current Trade-offs
1. **AI Dependency**: Requires backend for full functionality (can work offline with pattern matching)
2. **Source Processing**: Limited to text extraction (no image/table analysis)
3. **Real-time Collaboration**: Single-user only (no multi-editor support)
4. **Version Control**: No article versioning or change tracking

### With Another Day
1. **Enhanced Source Processing**: OCR for images, table extraction, better PDF parsing
2. **Collaborative Features**: Multi-editor support, comment system, approval workflows
3. **Advanced AI**: Fine-tuned models for specific industries, better quote detection
4. **Performance**: Caching, lazy loading, better error handling
5. **Analytics**: Track editing patterns, source usage, article performance

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn
- Google Gemini API key (free) or OpenAI API key

### Installation
```bash
# Clone repository
git clone <repository-url>
cd article-draft-mvp

# Install dependencies
npm run install:all

# Set up environment
cp backend/env.example backend/.env
# Edit backend/.env with your API keys

# Start development servers
npm run dev:full
```

### Environment Setup
```env
# backend/.env
USE_GEMINI=true
GEMINI_API_KEY=your_gemini_key_here
OPENAI_API_KEY=your_openai_key_here
PORT=5000
```

## 🧪 Testing

### Sample Inputs
- **Interview Transcript**: Tech startup founder interview (3,000+ words)
- **Supporting Sources**: 
  - Company website article
  - Product brochure PDF
  - YouTube interview video

### Test Scenarios
1. **Happy Path**: Complete workflow from transcript to published article
2. **Source Verification**: Verify all claims trace back to sources
3. **Quote Accuracy**: Ensure quotes match source material exactly
4. **Error Handling**: Test with invalid inputs and network failures

## 📊 Performance

- **Transcript Handling**: Tested with 10k+ character transcripts
- **Source Processing**: Supports multiple PDFs, web articles, YouTube videos
- **AI Response Time**: 2-5 seconds for key point extraction, 10-30 seconds for full draft
- **Memory Usage**: Optimized for browser compatibility

## 🔒 Security & Privacy

- **API Keys**: Stored in environment variables, never committed
- **Data Processing**: All processing happens locally or via secure APIs
- **No Data Storage**: No user data persisted beyond session
- **Public Sources Only**: Designed for publicly available materials

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

This is a 24-hour challenge submission. For production use, consider:
- Adding comprehensive test coverage
- Implementing proper error boundaries
- Adding accessibility features
- Optimizing for mobile devices

---

**Built in 24 hours for the Low-Code Challenge** ⏰