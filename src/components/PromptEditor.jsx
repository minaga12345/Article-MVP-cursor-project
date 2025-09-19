import React, { useState, useEffect } from 'react'
import { Settings, Save, RotateCcw, Eye, EyeOff } from 'lucide-react'
import ApiService from '../services/api'

const PromptEditor = ({ onClose, onPromptsUpdate }) => {
  const [prompts, setPrompts] = useState({
    keyPointsExtraction: '',
    draftGeneration: '',
    sourceMapping: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPreview, setShowPreview] = useState({})

  useEffect(() => {
    loadPrompts()
  }, [])

  const loadPrompts = async () => {
    setIsLoading(true)
    try {
      const data = await ApiService.getPrompts()
      setPrompts(data)
    } catch (error) {
      console.error('Failed to load prompts:', error)
      setError('Failed to load prompts. Using default prompts.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccess('')
    
    try {
      await ApiService.updatePrompts(prompts)
      setSuccess('Prompts saved successfully!')
      if (onPromptsUpdate) {
        onPromptsUpdate(prompts)
      }
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Failed to save prompts. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleReset = () => {
    const defaultPrompts = {
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
    }
    
    setPrompts(defaultPrompts)
    setSuccess('Prompts reset to defaults!')
    setTimeout(() => setSuccess(''), 3000)
  }

  const togglePreview = (key) => {
    setShowPreview(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const promptTemplates = {
    keyPointsExtraction: {
      title: 'Key Points Extraction',
      description: 'Instructions for extracting key points from transcripts',
      variables: ['transcript', 'sources']
    },
    draftGeneration: {
      title: 'Draft Generation',
      description: 'Instructions for generating article drafts',
      variables: ['{projectName}', '{tone}', '{angle}', '{length}', '{keyPoints}']
    },
    sourceMapping: {
      title: 'Source Mapping',
      description: 'Instructions for mapping content to sources',
      variables: ['draft', 'sources']
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem'
        }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Settings size={20} />
            Prompt Editor
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: '#64748b'
            }}
          >
            ×
          </button>
        </div>

        {error && (
          <div className="error" style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success" style={{ marginBottom: '1rem' }}>
            {success}
          </div>
        )}

        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            Loading prompts...
          </div>
        ) : (
          <div>
            {Object.entries(promptTemplates).map(([key, template]) => (
              <div key={key} style={{ marginBottom: '2rem' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '0.5rem'
                }}>
                  <h3 style={{ margin: 0 }}>{template.title}</h3>
                  <button
                    onClick={() => togglePreview(key)}
                    className="btn btn-secondary btn-sm"
                  >
                    {showPreview[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                    {showPreview[key] ? 'Hide' : 'Show'} Preview
                  </button>
                </div>
                
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                  {template.description}
                </p>
                
                {template.variables.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <strong>Available variables:</strong> {template.variables.join(', ')}
                  </div>
                )}
                
                <textarea
                  value={prompts[key]}
                  onChange={(e) => setPrompts(prev => ({
                    ...prev,
                    [key]: e.target.value
                  }))}
                  rows={showPreview[key] ? 3 : 8}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '0.9rem',
                    resize: 'vertical'
                  }}
                  placeholder={`Enter your ${template.title.toLowerCase()} prompt...`}
                />
              </div>
            ))}

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '2rem',
              paddingTop: '1rem',
              borderTop: '1px solid #e2e8f0'
            }}>
              <button
                onClick={handleReset}
                className="btn btn-secondary"
                disabled={isSaving}
              >
                <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
                Reset to Defaults
              </button>
              <button
                onClick={handleSave}
                className="btn"
                disabled={isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Prompts'}
                <Save size={16} style={{ marginLeft: '0.5rem' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PromptEditor
