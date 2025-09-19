import React from 'react'
import { Edit3, Palette, Target, Ruler, ArrowLeft } from 'lucide-react'

const StoryDirection = ({ project, onUpdate, onComplete, onBack }) => {
  const handleDirectionChange = (field, value) => {
    onUpdate({
      storyDirection: {
        ...project.storyDirection,
        [field]: value
      }
    })
  }

  const toneOptions = [
    { value: 'professional', label: 'Professional', description: 'Formal, authoritative, business-focused' },
    { value: 'conversational', label: 'Conversational', description: 'Friendly, approachable, easy to read' },
    { value: 'technical', label: 'Technical', description: 'Detailed, precise, developer-focused' },
    { value: 'storytelling', label: 'Storytelling', description: 'Narrative-driven, engaging, human-centered' }
  ]

  const angleOptions = [
    { value: 'founder', label: 'Founder Story', description: 'Focus on the journey and personal insights' },
    { value: 'technical', label: 'Technical Deep-dive', description: 'Product features and technical achievements' },
    { value: 'market', label: 'Market Analysis', description: 'Industry trends and competitive landscape' },
    { value: 'impact', label: 'Impact & Results', description: 'Metrics, outcomes, and real-world effects' },
    { value: 'future', label: 'Future Vision', description: 'Roadmap, predictions, and upcoming developments' }
  ]

  const lengthOptions = [
    { value: 'short', label: 'Short (500-800 words)', description: 'Quick read, key highlights only' },
    { value: 'medium', label: 'Medium (800-1500 words)', description: 'Balanced depth and breadth' },
    { value: 'long', label: 'Long (1500+ words)', description: 'Comprehensive coverage with details' }
  ]

  const canProceed = project.storyDirection.tone && project.storyDirection.angle && project.storyDirection.length

  return (
    <div>
      <h2>Story Direction</h2>
      <p style={{ marginBottom: '2rem', color: '#64748b' }}>
        Set the tone, angle, and length for your article to guide the AI in generating the right content.
      </p>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Palette size={16} />
          Tone
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {toneOptions.map((option) => (
            <div
              key={option.value}
              style={{
                border: `2px solid ${project.storyDirection.tone === option.value ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                backgroundColor: project.storyDirection.tone === option.value ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}
              onClick={() => handleDirectionChange('tone', option.value)}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{option.label}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} />
          Angle
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {angleOptions.map((option) => (
            <div
              key={option.value}
              style={{
                border: `2px solid ${project.storyDirection.angle === option.value ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                backgroundColor: project.storyDirection.angle === option.value ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}
              onClick={() => handleDirectionChange('angle', option.value)}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{option.label}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ruler size={16} />
          Length
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {lengthOptions.map((option) => (
            <div
              key={option.value}
              style={{
                border: `2px solid ${project.storyDirection.length === option.value ? '#3b82f6' : '#e2e8f0'}`,
                borderRadius: '8px',
                padding: '1rem',
                cursor: 'pointer',
                backgroundColor: project.storyDirection.length === option.value ? '#eff6ff' : 'white',
                transition: 'all 0.2s'
              }}
              onClick={() => handleDirectionChange('length', option.value)}
            >
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>{option.label}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{option.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="customPrompt">Custom Instructions (Optional)</label>
        <textarea
          id="customPrompt"
          value={project.storyDirection.customPrompt || ''}
          onChange={(e) => handleDirectionChange('customPrompt', e.target.value)}
          placeholder="Add any specific instructions for the article generation..."
          rows={3}
        />
      </div>

      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#0f172a' }}>Preview</h4>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>
          <strong>Tone:</strong> {toneOptions.find(t => t.value === project.storyDirection.tone)?.label || 'Not selected'}<br/>
          <strong>Angle:</strong> {angleOptions.find(a => a.value === project.storyDirection.angle)?.label || 'Not selected'}<br/>
          <strong>Length:</strong> {lengthOptions.find(l => l.value === project.storyDirection.length)?.label || 'Not selected'}
          {project.storyDirection.customPrompt && (
            <>
              <br/><strong>Custom:</strong> {project.storyDirection.customPrompt}
            </>
          )}
        </p>
      </div>

      {/* Editor Summary */}
      <div style={{ 
        background: '#f8fafc', 
        border: '1px solid #e2e8f0', 
        borderRadius: '8px', 
        padding: '1rem',
        marginTop: '2rem'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Story Direction Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Tone:</strong> {toneOptions.find(t => t.value === project.storyDirection.tone)?.label || 'Not selected'}
          </div>
          <div>
            <strong>Angle:</strong> {angleOptions.find(a => a.value === project.storyDirection.angle)?.label || 'Not selected'}
          </div>
          <div>
            <strong>Length:</strong> {lengthOptions.find(l => l.value === project.storyDirection.length)?.label || 'Not selected'}
          </div>
          <div>
            <strong>Custom Instructions:</strong> {project.storyDirection.customPrompt ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Back to Key Points
        </button>
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="btn"
        >
          Continue to Draft Generation
        </button>
      </div>
    </div>
  )
}

export default StoryDirection
