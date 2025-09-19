const API_BASE_URL = 'http://localhost:5000/api';

class ApiService {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // Get custom prompts
  async getPrompts() {
    return this.request('/prompts');
  }

  // Update custom prompts
  async updatePrompts(prompts) {
    return this.request('/prompts', {
      method: 'PUT',
      body: JSON.stringify(prompts),
    });
  }

  // Extract key points using LLM
  async extractKeyPoints(transcript, sources, customPrompt) {
    return this.request('/extract-key-points', {
      method: 'POST',
      body: JSON.stringify({ transcript, sources, customPrompt }),
    });
  }

  // Generate draft using LLM
  async generateDraft(projectName, tone, angle, length, keyPoints, sources, customPrompt, draftType) {
    return this.request('/generate-draft', {
      method: 'POST',
      body: JSON.stringify({
        projectName,
        tone,
        angle,
        length,
        keyPoints,
        sources,
        customPrompt,
        draftType,
      }),
    });
  }

  // Process PDF files
  async processPDF(file) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    return this.request('/process-pdf', {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  // Process YouTube videos
  async processYouTube(url) {
    return this.request('/process-youtube', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Process web links
  async processWeb(url) {
    return this.request('/process-web', {
      method: 'POST',
      body: JSON.stringify({ url }),
    });
  }

  // Analyze sources and quotes
  async analyzeSources(draft, sources, customPrompt) {
    console.log('API: analyzeSources called with:')
    console.log('Draft length:', draft?.length || 0)
    console.log('Sources count:', sources?.length || 0)
    console.log('Sources:', sources)
    
    return this.request('/analyze-sources', {
      method: 'POST',
      body: JSON.stringify({ draft, sources, customPrompt }),
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export default new ApiService();
