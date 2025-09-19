import React, { useState } from 'react'
import { Upload, Link, FileText, Plus, X } from 'lucide-react'

const ProjectSetup = ({ project, onUpdate, onComplete, onError }) => {
  const [newSource, setNewSource] = useState({ type: 'url', content: '', title: '' })

  const handleTranscriptChange = (e) => {
    onUpdate({ transcript: e.target.value })
  }

  const handleProjectNameChange = (e) => {
    onUpdate({ name: e.target.value })
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        onUpdate({ transcript: event.target.result })
      }
      reader.readAsText(file)
    }
  }

  const addSource = () => {
    if (!newSource.content.trim() || !newSource.title.trim()) {
      onError('Please provide both title and content for the source')
      return
    }

    const source = {
      id: Date.now().toString(),
      type: newSource.type,
      title: newSource.title,
      content: newSource.content,
      addedAt: new Date().toISOString()
    }

    onUpdate({ sources: [...project.sources, source] })
    setNewSource({ type: 'url', content: '', title: '' })
  }

  const removeSource = (sourceId) => {
    onUpdate({ sources: project.sources.filter(s => s.id !== sourceId) })
  }

  const canProceed = project.name.trim() && project.transcript.trim() && project.sources.length > 0

  return (
    <div>
      <h2>Project Setup</h2>
      
      <div className="form-group">
        <label htmlFor="projectName">Project Name</label>
        <input
          id="projectName"
          type="text"
          value={project.name}
          onChange={handleProjectNameChange}
          placeholder="Enter a name for your article project"
        />
      </div>

      <div className="form-group">
        <label htmlFor="transcript">Interview Transcript</label>
        <textarea
          id="transcript"
          value={project.transcript}
          onChange={handleTranscriptChange}
          placeholder="Paste your interview transcript here..."
          rows={10}
        />
        <div style={{ marginTop: '0.5rem' }}>
          <label htmlFor="fileUpload" className="btn btn-secondary" style={{ display: 'inline-block', cursor: 'pointer' }}>
            <Upload size={16} style={{ marginRight: '0.5rem' }} />
            Upload File
          </label>
          <input
            id="fileUpload"
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="form-group">
        <label>Supporting Sources</label>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Add at least one supporting source (web articles, PDFs, YouTube videos, etc.)
        </p>

        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <select
            value={newSource.type}
            onChange={(e) => setNewSource(prev => ({ ...prev, type: e.target.value }))}
            style={{ width: '120px' }}
          >
            <option value="url">Web URL</option>
            <option value="text">Text Content</option>
            <option value="youtube">YouTube</option>
          </select>
          <input
            type="text"
            value={newSource.title}
            onChange={(e) => setNewSource(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Source title"
            style={{ flex: 1 }}
          />
          <button onClick={addSource} className="btn btn-success">
            <Plus size={16} />
          </button>
        </div>

        <div className="form-group">
          <textarea
            value={newSource.content}
            onChange={(e) => setNewSource(prev => ({ ...prev, content: e.target.value }))}
            placeholder={
              newSource.type === 'url' 
                ? 'Enter the URL...' 
                : newSource.type === 'youtube'
                ? 'Enter YouTube URL or video ID...'
                : 'Paste the text content...'
            }
            rows={3}
          />
        </div>

        {project.sources.length > 0 && (
          <div>
            <h4 style={{ marginBottom: '1rem' }}>Added Sources ({project.sources.length})</h4>
            {project.sources.map((source) => (
              <div key={source.id} className="source-item">
                <div className="source-info">
                  <h4>{source.title}</h4>
                  <p>{source.content.substring(0, 100)}...</p>
                  <span className="source-type">{source.type.toUpperCase()}</span>
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="btn btn-danger btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'right', marginTop: '2rem' }}>
        <button
          onClick={onComplete}
          disabled={!canProceed}
          className="btn"
        >
          Continue to Key Points Extraction
        </button>
      </div>
    </div>
  )
}

export default ProjectSetup
