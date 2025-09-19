import React, { useState, useEffect } from 'react'
import { Upload, FileText, CheckCircle, Edit3, Download, Link, Quote, Settings, Zap } from 'lucide-react'
import ProjectSetup from './components/ProjectSetup'
import KeyPointsExtraction from './components/KeyPointsExtraction'
import StoryDirection from './components/StoryDirection'
import DraftGeneration from './components/DraftGeneration'
import SourceMapping from './components/SourceMapping'
import Export from './components/Export'
import PromptEditor from './components/PromptEditor'
import ApiService from './services/api'

const STEPS = [
  { id: 'setup', name: 'Setup', icon: Upload },
  { id: 'extract', name: 'Extract Points', icon: FileText },
  { id: 'direction', name: 'Story Direction', icon: Edit3 },
  { id: 'draft', name: 'Generate Draft', icon: CheckCircle },
  { id: 'mapping', name: 'Source Mapping', icon: Link },
  { id: 'export', name: 'Export', icon: Download }
]

function App() {
  const [currentStep, setCurrentStep] = useState('setup')
  const [project, setProject] = useState({
    name: '',
    transcript: '',
    sources: [],
    keyPoints: [],
    storyDirection: {
      tone: 'professional',
      angle: 'technical',
      length: 'medium'
    },
    draft: '',
    sourceMappings: []
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPromptEditor, setShowPromptEditor] = useState(false)
  const [useLLM, setUseLLM] = useState(false)
  const [backendStatus, setBackendStatus] = useState('checking')

  const handleProjectUpdate = (updates) => {
    setProject(prev => ({ ...prev, ...updates }))
  }

  const handleStepComplete = (step) => {
    const stepIndex = STEPS.findIndex(s => s.id === step)
    if (stepIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[stepIndex + 1].id)
    }
  }

  const handleStepBack = (step) => {
    const stepIndex = STEPS.findIndex(s => s.id === step)
    if (stepIndex > 0) {
      setCurrentStep(STEPS[stepIndex - 1].id)
    }
  }

  const handleError = (errorMessage) => {
    setError(errorMessage)
    setTimeout(() => setError(''), 5000)
  }

  // Check backend status on component mount
  useEffect(() => {
    checkBackendStatus()
  }, [])

  const checkBackendStatus = async () => {
    try {
      const response = await ApiService.healthCheck()
      setBackendStatus('connected')
      console.log('AI Service:', response.aiService)
    } catch (error) {
      setBackendStatus('disconnected')
    }
  }

  const handlePromptsUpdate = (newPrompts) => {
    console.log('Prompts updated:', newPrompts)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'setup':
        return (
          <ProjectSetup
            project={project}
            onUpdate={handleProjectUpdate}
            onComplete={() => handleStepComplete('setup')}
            onError={handleError}
          />
        )
      case 'extract':
        return (
          <KeyPointsExtraction
            project={project}
            onUpdate={handleProjectUpdate}
            onComplete={() => handleStepComplete('extract')}
            onBack={() => handleStepBack('extract')}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            useLLM={useLLM}
          />
        )
      case 'direction':
        return (
          <StoryDirection
            project={project}
            onUpdate={handleProjectUpdate}
            onComplete={() => handleStepComplete('direction')}
            onBack={() => handleStepBack('direction')}
          />
        )
      case 'draft':
        return (
          <DraftGeneration
            project={project}
            onUpdate={handleProjectUpdate}
            onComplete={() => handleStepComplete('draft')}
            onBack={() => handleStepBack('draft')}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            useLLM={useLLM}
          />
        )
      case 'mapping':
        return (
          <SourceMapping
            project={project}
            onUpdate={handleProjectUpdate}
            onComplete={() => handleStepComplete('mapping')}
            onBack={() => handleStepBack('mapping')}
            onError={handleError}
            isLoading={isLoading}
            setIsLoading={setIsLoading}
            useLLM={useLLM}
          />
        )
      case 'export':
        return (
          <Export
            project={project}
            onComplete={() => handleStepComplete('export')}
            onBack={() => handleStepBack('export')}
            onRestart={() => {
              setCurrentStep('setup')
              setProject({
                name: '',
                transcript: '',
                sources: [],
                keyPoints: [],
                storyDirection: {
                  tone: 'professional',
                  angle: 'technical',
                  length: 'medium'
                },
                draft: '',
                sourceMappings: []
              })
            }}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="container">
      <div className="header">
        <h1>Article Draft MVP</h1>
        <p>Transform interview transcripts into compelling stories with AI assistance</p>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            fontSize: '0.8rem',
            color: '#64748b',
            textAlign: 'center',
            marginBottom: '0.5rem',
            width: '100%'
          }}>
            💡 <strong>Backend Connected</strong> = Server running | <strong>AI Processing ON</strong> = Using real AI | <strong>AI Processing OFF</strong> = Using pattern matching
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '0.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: backendStatus === 'connected' ? '#f0fdf4' : '#fef2f2',
            border: `1px solid ${backendStatus === 'connected' ? '#bbf7d0' : '#fecaca'}`,
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: backendStatus === 'connected' ? '#10b981' : '#ef4444'
            }} />
            {backendStatus === 'connected' ? 'Backend Connected' : 'Backend Disconnected'}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: useLLM ? '#f0fdf4' : '#f8fafc',
            border: `1px solid ${useLLM ? '#bbf7d0' : '#e2e8f0'}`,
            borderRadius: '20px',
            fontSize: '0.9rem'
          }}>
            <Zap size={16} style={{ color: useLLM ? '#10b981' : '#64748b' }} />
            {useLLM ? 'AI Processing ON' : 'AI Processing OFF'}
          </div>
          
          <button
            onClick={() => setUseLLM(!useLLM)}
            className={`btn ${useLLM ? 'btn-success' : 'btn-secondary'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={backendStatus !== 'connected'}
            title={backendStatus !== 'connected' ? 'Backend must be connected to use AI' : ''}
          >
            {useLLM ? 'Disable AI' : 'Enable AI'}
          </button>
          
          <button
            onClick={() => setShowPromptEditor(true)}
            className="btn btn-secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            disabled={backendStatus !== 'connected'}
            title={backendStatus !== 'connected' ? 'Backend must be connected to edit prompts' : ''}
          >
            <Settings size={16} />
            Edit Prompts
          </button>
        </div>
      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      <div className="step-indicator">
        {STEPS.map((step, index) => {
          const StepIcon = step.icon
          const isActive = currentStep === step.id
          const isCompleted = STEPS.findIndex(s => s.id === currentStep) > index
          const isPending = STEPS.findIndex(s => s.id === currentStep) < index

          return (
            <div
              key={step.id}
              className={`step ${isActive ? 'active' : isCompleted ? 'completed' : 'pending'}`}
            >
              <StepIcon size={16} />
              {step.name}
            </div>
          )
        })}
      </div>

      <div className="card">
        {renderCurrentStep()}
      </div>

      {showPromptEditor && (
        <PromptEditor
          onClose={() => setShowPromptEditor(false)}
          onPromptsUpdate={handlePromptsUpdate}
        />
      )}
    </div>
  )
}

export default App
