import React, { useState } from 'react'
import { FileText, RefreshCw, CheckCircle, Edit3, ArrowLeft, Zap } from 'lucide-react'
import ApiService from '../services/api'

const DraftGeneration = ({ project, onUpdate, onComplete, onBack, onError, isLoading, setIsLoading, useLLM }) => {
  const [draftType, setDraftType] = useState('outline')
  const [generatedContent, setGeneratedContent] = useState('')

  // Generate draft using LLM or template
  const generateDraft = async () => {
    setIsLoading(true)
    try {
      if (useLLM) {
        // Use LLM for generation
        const response = await ApiService.generateDraft(
          project.name,
          project.storyDirection.tone,
          project.storyDirection.angle,
          project.storyDirection.length,
          project.keyPoints,
          project.sources,
          project.storyDirection.customPrompt,
          draftType
        )
        
        if (response.success) {
          setGeneratedContent(response.draft)
        } else {
          throw new Error(response.error || 'LLM generation failed')
        }
      } else {
        // Use template generation (fallback)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const mockDraft = draftType === 'outline' 
          ? generateOutline()
          : generateFullDraft()
        
        setGeneratedContent(mockDraft)
      }
    } catch (error) {
      onError(`Failed to generate draft: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const generateOutline = () => {
    const keyPoints = project.keyPoints.map(point => `- ${point.text}`).join('\n')
    
    return `# ${project.name}

## Introduction
- Hook: Brief overview of the company's mission and impact
- Context: The current state of AI development and democratization
- Preview: What readers will learn about the company's journey

## Key Points Covered
${keyPoints}

## Supporting Evidence
- Analysis of interview insights
- Supporting source materials
- Industry context and trends

## Conclusion
- Summary of key achievements
- Future implications
- Call to action for readers

---
*Sources: Interview transcript, supporting materials*`
  }

  const generateFullDraft = () => {
    const keyPoints = project.keyPoints.map(point => point.text).join(' ')
    const tone = project.storyDirection.tone
    const angle = project.storyDirection.angle
    const length = project.storyDirection.length
    
    // Generate content based on actual key points and story direction
    let intro = `# ${project.name}\n\n## Introduction\n\n`
    
    if (tone === 'professional') {
      intro += `In the rapidly evolving landscape of artificial intelligence, ${project.name} has emerged as a significant player in democratizing AI development. `
    } else if (tone === 'conversational') {
      intro += `Let's talk about ${project.name} - a company that's making AI development more accessible than ever. `
    } else if (tone === 'technical') {
      intro += `From a technical perspective, ${project.name} represents a breakthrough in AI development infrastructure. `
    } else {
      intro += `The story of ${project.name} is one of innovation, community, and the democratization of AI development. `
    }
    
    intro += `Based on recent insights, here's what we've learned about their journey and impact.\n\n`
    
    // Add key points as main content
    let mainContent = `## Key Insights\n\n`
    project.keyPoints.forEach((point, index) => {
      mainContent += `${index + 1}. ${point.text}\n\n`
    })
    
    // Add sources section
    let sources = `## Sources and References\n\n`
    project.sources.forEach((source, index) => {
      sources += `${index + 1}. ${source.title} (${source.type})\n`
    })
    
    return intro + mainContent + sources + `\n---\n*This article was generated based on interview transcripts and supporting materials. All quotes and statistics are sourced from the original interview and provided documentation.*`
  }

  const handleAcceptDraft = () => {
    onUpdate({ draft: generatedContent })
    onComplete()
  }

  const handleEditDraft = () => {
    const editedContent = prompt('Edit the draft content:', generatedContent)
    if (editedContent !== null) {
      setGeneratedContent(editedContent)
    }
  }

  return (
    <div>
      <h2>Draft Generation</h2>
      
      {!generatedContent ? (
        <div>
          <p style={{ marginBottom: '2rem', color: '#64748b' }}>
            Generate an outline or full draft based on your selected key points and story direction.
          </p>

          <div className="form-group">
            <label>Draft Type</label>
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="draftType"
                  value="outline"
                  checked={draftType === 'outline'}
                  onChange={(e) => setDraftType(e.target.value)}
                />
                <FileText size={16} />
                Outline
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="draftType"
                  value="full"
                  checked={draftType === 'full'}
                  onChange={(e) => setDraftType(e.target.value)}
                />
                <Edit3 size={16} />
                Full Draft
              </label>
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={generateDraft}
              disabled={isLoading}
              className="btn"
            >
              {isLoading ? 'Generating Draft...' : `Generate ${draftType === 'outline' ? 'Outline' : 'Full Draft'}`}
              {useLLM && <Zap size={16} style={{ marginLeft: '0.5rem' }} />}
            </button>
            {useLLM && (
              <p style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                Using AI-powered generation
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>{draftType === 'outline' ? 'Generated Outline' : 'Generated Draft'}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleEditDraft}
                className="btn btn-secondary btn-sm"
              >
                <Edit3 size={16} />
                Edit
              </button>
              <button
                onClick={() => {
                  setGeneratedContent('')
                  setDraftType('outline')
                }}
                className="btn btn-secondary btn-sm"
              >
                <RefreshCw size={16} />
                Regenerate
              </button>
            </div>
          </div>

          <div className="draft-content">
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              fontFamily: 'inherit',
              fontSize: '1rem',
              lineHeight: '1.6',
              margin: 0
            }}>
              {generatedContent}
            </pre>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              onClick={onBack}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Back to Story Direction
            </button>
            <button
              onClick={handleAcceptDraft}
              className="btn"
            >
              <CheckCircle size={16} style={{ marginRight: '0.5rem' }} />
              Accept Draft & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default DraftGeneration
