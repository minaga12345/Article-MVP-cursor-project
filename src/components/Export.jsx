import React, { useState } from 'react'
import { Download, FileText, Code, Copy, Check, ArrowLeft, RotateCcw } from 'lucide-react'

const Export = ({ project, onComplete, onBack, onRestart }) => {
  const [copied, setCopied] = useState('')
  const [showProvenance, setShowProvenance] = useState(false)

  const generateProvenanceJSON = () => {
    const provenance = {
      project: {
        name: project.name,
        createdAt: new Date().toISOString(),
        version: '1.0.0'
      },
      sources: project.sources.map(source => ({
        id: source.id,
        type: source.type,
        title: source.title,
        content: source.content.substring(0, 100) + '...',
        addedAt: source.addedAt
      })),
      keyPoints: project.keyPoints.map(point => ({
        id: point.id,
        text: point.text,
        category: point.category,
        confidence: point.confidence,
        source: point.source
      })),
      storyDirection: project.storyDirection,
      sourceMappings: project.sourceMappings.map(mapping => ({
        paragraphIndex: mapping.paragraphIndex,
        sourceId: mapping.sourceId,
        confidence: mapping.confidence,
        matchType: mapping.matchType
      })),
      metadata: {
        totalSources: project.sources.length,
        totalKeyPoints: project.keyPoints.length,
        totalMappings: project.sourceMappings.length,
        generatedAt: new Date().toISOString()
      }
    }
    return JSON.stringify(provenance, null, 2)
  }

  const copyToClipboard = async (content, type) => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const downloadFile = (content, filename, mimeType) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleExportMarkdown = () => {
    downloadFile(project.draft, `${project.name.replace(/\s+/g, '_')}.md`, 'text/markdown')
  }

  const handleExportProvenance = () => {
    const provenance = generateProvenanceJSON()
    downloadFile(provenance, `${project.name.replace(/\s+/g, '_')}_provenance.json`, 'application/json')
  }

  const handleExportBoth = () => {
    handleExportMarkdown()
    handleExportProvenance()
  }

  return (
    <div>
      <h2>Export Article</h2>
      
      <div style={{ 
        background: '#f0fdf4', 
        border: '1px solid #bbf7d0', 
        borderRadius: '8px', 
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h4 style={{ margin: '0 0 0.5rem 0', color: '#166534', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Check size={16} />
          Article Ready for Export
        </h4>
        <p style={{ margin: 0, color: '#166534' }}>
          Your article has been generated and verified. Choose your export format below.
        </p>
      </div>

      {/* Article Preview */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Article Preview</h3>
        <div className="draft-content" style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <pre style={{ 
            whiteSpace: 'pre-wrap', 
            fontFamily: 'inherit',
            fontSize: '1rem',
            lineHeight: '1.6',
            margin: 0
          }}>
            {project.draft}
          </pre>
        </div>
      </div>

      {/* Export Options */}
      <div style={{ marginBottom: '2rem' }}>
        <h3>Export Options</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <FileText size={32} style={{ color: '#3b82f6', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Markdown</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              Export the article as a Markdown file
            </p>
            <button
              onClick={handleExportMarkdown}
              className="btn"
              style={{ width: '100%' }}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Download MD
            </button>
          </div>

          <div style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <Code size={32} style={{ color: '#10b981', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Provenance JSON</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              Export source mappings and metadata
            </p>
            <button
              onClick={handleExportProvenance}
              className="btn btn-success"
              style={{ width: '100%' }}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Download JSON
            </button>
          </div>

          <div style={{ 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1.5rem',
            textAlign: 'center'
          }}>
            <FileText size={32} style={{ color: '#8b5cf6', marginBottom: '1rem' }} />
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Both Files</h4>
            <p style={{ margin: '0 0 1rem 0', color: '#64748b', fontSize: '0.9rem' }}>
              Download article and provenance together
            </p>
            <button
              onClick={handleExportBoth}
              className="btn"
              style={{ width: '100%', background: '#8b5cf6' }}
            >
              <Download size={16} style={{ marginRight: '0.5rem' }} />
              Download Both
            </button>
          </div>
        </div>

        {/* Copy to Clipboard Options */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '8px', 
          padding: '1rem'
        }}>
          <h4 style={{ margin: '0 0 1rem 0' }}>Copy to Clipboard</h4>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => copyToClipboard(project.draft, 'markdown')}
              className="btn btn-secondary"
            >
              {copied === 'markdown' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'markdown' ? 'Copied!' : 'Copy Markdown'}
            </button>
            <button
              onClick={() => copyToClipboard(generateProvenanceJSON(), 'json')}
              className="btn btn-secondary"
            >
              {copied === 'json' ? <Check size={16} /> : <Copy size={16} />}
              {copied === 'json' ? 'Copied!' : 'Copy JSON'}
            </button>
          </div>
        </div>
      </div>

      {/* Provenance Preview */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3>Provenance Data</h3>
          <button
            onClick={() => setShowProvenance(!showProvenance)}
            className="btn btn-secondary btn-sm"
          >
            {showProvenance ? 'Hide' : 'Show'} JSON
          </button>
        </div>
        
        {showProvenance && (
          <div style={{ 
            background: '#1e293b', 
            color: '#e2e8f0', 
            borderRadius: '8px', 
            padding: '1rem',
            overflow: 'auto',
            maxHeight: '300px'
          }}>
            <pre style={{ margin: 0, fontSize: '0.9rem' }}>
              {generateProvenanceJSON()}
            </pre>
          </div>
        )}
      </div>

      {/* Project Summary */}
      <div style={{ 
        background: '#f0f9ff', 
        border: '1px solid #bae6fd', 
        borderRadius: '8px', 
        padding: '1rem',
        marginBottom: '2rem'
      }}>
        <h4 style={{ margin: '0 0 1rem 0', color: '#0c4a6e' }}>Project Summary</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Project Name:</strong><br/>
            {project.name}
          </div>
          <div>
            <strong>Sources:</strong><br/>
            {project.sources.length} attached
          </div>
          <div>
            <strong>Key Points:</strong><br/>
            {project.keyPoints.length} selected
          </div>
          <div>
            <strong>Story Direction:</strong><br/>
            {project.storyDirection.tone} • {project.storyDirection.angle}
          </div>
          <div>
            <strong>Source Mappings:</strong><br/>
            {project.sourceMappings.length} verified
          </div>
          <div>
            <strong>Article Length:</strong><br/>
            {project.draft.split(' ').length} words
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button
          onClick={onBack}
          className="btn btn-secondary"
        >
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Back to Source Mapping
        </button>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to start a new project? This will clear all current data.')) {
                onRestart()
              }
            }}
            className="btn btn-secondary"
          >
            <RotateCcw size={16} style={{ marginRight: '0.5rem' }} />
            Start New Project
          </button>
          
          <button
            onClick={() => {
              if (window.confirm('Project completed! Would you like to start a new project or stay on this page?')) {
                onRestart()
              } else {
                onComplete()
              }
            }}
            className="btn btn-success"
            style={{ fontSize: '1.1rem', padding: '1rem 2rem' }}
          >
            <Check size={20} style={{ marginRight: '0.5rem' }} />
            Complete Project
          </button>
        </div>
      </div>
    </div>
  )
}

export default Export
