import React, { useState, useEffect } from 'react'
import { CheckCircle, X, RotateCcw, ArrowUp, ArrowDown, Zap, ArrowLeft } from 'lucide-react'
import ApiService from '../services/api'

const KeyPointsExtraction = ({ project, onUpdate, onComplete, onBack, onError, isLoading, setIsLoading, useLLM }) => {
  const [extractedPoints, setExtractedPoints] = useState([])
  const [hasExtracted, setHasExtracted] = useState(false)

  // Extract key points using LLM or pattern matching
  const extractKeyPoints = async () => {
    setIsLoading(true)
    try {
      if (useLLM) {
        // Use LLM for extraction
        const response = await ApiService.extractKeyPoints(
          project.transcript,
          project.sources
        )
        
        if (response.success) {
          // Ensure all points have proper properties and unique IDs
          const processedPoints = response.keyPoints.map((point, index) => ({
            ...point,
            id: point.id || `llm-${index}-${Date.now()}-${Math.random()}`,
            selected: point.selected || false,
            edited: point.edited || false,
            custom: point.custom || false
          }))
          console.log('Processed LLM points:', processedPoints)
          setExtractedPoints(processedPoints)
          setHasExtracted(true)
        } else {
          throw new Error(response.error || 'LLM extraction failed')
        }
      } else {
        // Use pattern matching (fallback)
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        const transcript = project.transcript.toLowerCase()
        const extractedPoints = []
        
        const patterns = [
          {
            pattern: /founded in \d{4}/i,
            category: 'background',
            confidence: 0.95
          },
          {
            pattern: /challenges?.*(?:include|are|involve)/i,
            category: 'challenges',
            confidence: 0.88
          },
          {
            pattern: /(?:serve|grown to|reached).*\d+.*(?:developers?|users?|customers?)/i,
            category: 'metrics',
            confidence: 0.92
          },
          {
            pattern: /(?:future|plans?|next|roadmap)/i,
            category: 'future',
            confidence: 0.85
          },
          {
            pattern: /(?:believe|principles?|values?|philosophy)/i,
            category: 'values',
            confidence: 0.90
          }
        ]
        
        const sentences = project.transcript.split(/[.!?]+/).filter(s => s.trim().length > 20)
        
        sentences.forEach((sentence, index) => {
          const trimmedSentence = sentence.trim()
          if (trimmedSentence.length < 30) return
          
          patterns.forEach((pattern, patternIndex) => {
            if (pattern.pattern.test(trimmedSentence)) {
              const uniqueId = `${index}-${pattern.category}-${patternIndex}-${Date.now()}`
              console.log('Creating point with ID:', uniqueId)
              extractedPoints.push({
                id: uniqueId,
                text: trimmedSentence,
                confidence: pattern.confidence,
                source: 'transcript',
                category: pattern.category,
                selected: false,
                edited: false,
                custom: false
              })
            }
          })
        })
        
        if (extractedPoints.length === 0) {
          const meaningfulSentences = sentences
            .filter(s => s.length > 50 && s.length < 200)
            .slice(0, 5)
            .map((sentence, index) => {
              const uniqueId = `general-${index}-${Date.now()}-${Math.random()}`
              console.log('Creating fallback point with ID:', uniqueId)
              return {
                id: uniqueId,
                text: sentence.trim(),
                confidence: 0.75,
                source: 'transcript',
                category: 'general',
                selected: false,
                edited: false,
                custom: false
              }
            })
          extractedPoints.push(...meaningfulSentences)
        }
        
        // Ensure all points have IDs before setting state
        const pointsWithIds = extractedPoints.map((point, index) => ({
          ...point,
          id: point.id || `fallback-${index}-${Date.now()}-${Math.random()}`
        }))
        
        console.log('Final extracted points with IDs:', pointsWithIds)
        setExtractedPoints(pointsWithIds)
        setHasExtracted(true)
      }
    } catch (error) {
      onError(`Failed to extract key points: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const togglePointSelection = (pointId) => {
    console.log('=== TOGGLE DEBUG ===')
    console.log('Toggling point ID:', pointId)
    
    if (!pointId) {
      console.error('Cannot toggle: pointId is undefined or null')
      return
    }
    
    setExtractedPoints(prev => {
      console.log('Current points before toggle:', prev.map(p => ({ id: p.id, selected: p.selected })))
      
      const updated = prev.map(point => {
        if (point.id === pointId) {
          console.log('Found matching point:', point.id, 'current selected:', point.selected, 'will toggle to:', !point.selected)
          return { ...point, selected: !point.selected }
        }
        return point
      })
      
      console.log('Updated points after toggle:', updated.map(p => ({ id: p.id, selected: p.selected })))
      return updated
    })
  }

  const selectAllPoints = () => {
    setExtractedPoints(prev => 
      prev.map(point => ({ ...point, selected: true }))
    )
  }

  const deselectAllPoints = () => {
    setExtractedPoints(prev => 
      prev.map(point => ({ ...point, selected: false }))
    )
  }

  const editPoint = (pointId, newText) => {
    setExtractedPoints(prev => 
      prev.map(point => 
        point.id === pointId 
          ? { ...point, text: newText, edited: true }
          : point
      )
    )
  }

  const addCustomPoint = () => {
    const uniqueId = `custom-${Date.now()}-${Math.random()}`
    console.log('Creating custom point with ID:', uniqueId)
    const newPoint = {
      id: uniqueId,
      text: 'Add your custom key point here...',
      confidence: 1.0,
      source: 'custom',
      category: 'custom',
      selected: false,
      edited: true,
      custom: true
    }
    setExtractedPoints(prev => [...prev, newPoint])
  }

  const movePoint = (pointId, direction) => {
    const currentIndex = extractedPoints.findIndex(p => p.id === pointId)
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
    
    if (newIndex >= 0 && newIndex < extractedPoints.length) {
      const newPoints = [...extractedPoints]
      const [movedPoint] = newPoints.splice(currentIndex, 1)
      newPoints.splice(newIndex, 0, movedPoint)
      setExtractedPoints(newPoints)
    }
  }

  const approveSelectedPoints = () => {
    const selectedPoints = extractedPoints
      .filter(point => point.selected)
      .map(point => ({
        id: point.id,
        text: point.text,
        category: point.category,
        confidence: point.confidence,
        source: point.source
      }))
    
    onUpdate({ keyPoints: selectedPoints })
    onComplete()
  }

  const selectedCount = extractedPoints.filter(p => p.selected).length

  return (
    <div>
      <h2>Key Points Extraction</h2>
      
      {!hasExtracted ? (
        <div>
          <p style={{ marginBottom: '2rem', color: '#64748b' }}>
            AI will analyze your transcript and supporting sources to extract key points. 
            You can then review, edit, and select which points to include in your article.
          </p>
          
          <div style={{ textAlign: 'center' }}>
            <button
              onClick={extractKeyPoints}
              disabled={isLoading}
              className="btn"
            >
              {isLoading ? 'Extracting Key Points...' : 'Extract Key Points'}
              {useLLM && <Zap size={16} style={{ marginLeft: '0.5rem' }} />}
            </button>
            {useLLM && (
              <p style={{ marginTop: '0.5rem', color: '#10b981', fontSize: '0.9rem' }}>
                Using AI-powered extraction
              </p>
            )}
          </div>
        </div>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3>Extracted Key Points ({extractedPoints.length})</h3>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ color: '#64748b' }}>
                {selectedCount} selected
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={addCustomPoint}
                  className="btn btn-success btn-sm"
                >
                  + Add Custom Point
                </button>
                <button
                  onClick={selectAllPoints}
                  className="btn btn-secondary btn-sm"
                >
                  Select All
                </button>
                <button
                  onClick={deselectAllPoints}
                  className="btn btn-secondary btn-sm"
                >
                  Deselect All
                </button>
                <button
                  onClick={() => {
                    setHasExtracted(false)
                    setExtractedPoints([])
                  }}
                  className="btn btn-secondary btn-sm"
                >
                  <RotateCcw size={16} />
                  Re-extract
                </button>
              </div>
            </div>
          </div>

          <div className="key-points">
            {extractedPoints.map((point, index) => (
              <div key={`point-${point.id}-${index}`} className="key-point">
                <input
                  type="checkbox"
                  id={`checkbox-${point.id}`}
                  checked={point.selected || false}
                  onChange={(e) => {
                    e.stopPropagation()
                    console.log('=== CHECKBOX CLICK DEBUG ===')
                    console.log('Full point object:', point)
                    console.log('Checkbox clicked for point ID:', point.id)
                    console.log('Event target checked:', e.target.checked)
                    console.log('Current point selected state:', point.selected)
                    console.log('All points before click:', extractedPoints.map(p => ({ id: p.id, selected: p.selected })))
                    
                    if (point.id) {
                      togglePointSelection(point.id)
                    } else {
                      console.error('Point ID is undefined! Point object:', point)
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
                
                <div className="key-point-content" style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <h4 style={{ margin: 0, flex: 1 }}>
                      <textarea
                        value={point.text}
                        onChange={(e) => editPoint(point.id, e.target.value)}
                        style={{
                          width: '100%',
                          border: 'none',
                          background: 'transparent',
                          resize: 'vertical',
                          minHeight: '2rem',
                          fontFamily: 'inherit',
                          fontSize: 'inherit',
                          fontWeight: 'inherit'
                        }}
                      />
                    </h4>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => movePoint(point.id, 'up')}
                        disabled={index === 0}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem' }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        onClick={() => movePoint(point.id, 'down')}
                        disabled={index === extractedPoints.length - 1}
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '0.25rem' }}
                      >
                        <ArrowDown size={14} />
                      </button>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="source-type" style={{ fontSize: '0.75rem' }}>
                      {point.category.toUpperCase()}
                    </span>
                    {point.edited && (
                      <span style={{ 
                        background: '#fef3c7', 
                        color: '#92400e', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        ✏️ EDITED
                      </span>
                    )}
                    {point.custom && (
                      <span style={{ 
                        background: '#dbeafe', 
                        color: '#1e40af', 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '4px', 
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        ➕ CUSTOM
                      </span>
                    )}
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Confidence: {Math.round(point.confidence * 100)}%
                    </span>
                    <span style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      Source: {point.source}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Editor Summary */}
          <div style={{ 
            background: '#f8fafc', 
            border: '1px solid #e2e8f0', 
            borderRadius: '8px', 
            padding: '1rem',
            marginTop: '2rem'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: '#0f172a' }}>Editor Summary</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <strong>Total Points:</strong> {extractedPoints.length}
              </div>
              <div>
                <strong>Selected:</strong> {selectedCount}
              </div>
              <div>
                <strong>Edited:</strong> {extractedPoints.filter(p => p.edited).length}
              </div>
              <div>
                <strong>Custom Added:</strong> {extractedPoints.filter(p => p.custom).length}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
            <button
              onClick={onBack}
              className="btn btn-secondary"
            >
              <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
              Back to Setup
            </button>
            <button
              onClick={approveSelectedPoints}
              disabled={selectedCount === 0}
              className="btn"
            >
              Approve Selected Points ({selectedCount}) & Continue
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default KeyPointsExtraction
