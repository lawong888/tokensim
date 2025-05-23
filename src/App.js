import { useState, useEffect } from 'react'
import { useTransition, animated } from '@react-spring/web'
import { v4 as uuidv4 } from 'uuid'
import TokenPlate from './TokenPlate.jsx'
import TokenMeter from './TokenMeter.jsx'
import './App.css'

const CONTEXT_SIZES = [1024, 2048, 4096, 8192, 32768]

function App() {
  const [contextSize, setContextSize] = useState(4096)
  const [tokens, setTokens] = useState([])
  const [tokenCounts, setTokenCounts] = useState({ system: 0, user: 0, response: 0 })

  // Generate initial system tokens
  useEffect(() => {
    const systemTokens = Array.from({ length: 5 }, () => ({
      type: 'system',
      length: Math.floor(Math.random() * 4 + 2),
      id: uuidv4()
    }))
    setTokens(systemTokens)
  }, [])

  // Update token counts
  useEffect(() => {
    const counts = tokens.reduce((acc, token) => {
      acc[token.type] += token.length
      return acc
    }, { system: 0, user: 0, response: 0 })
    setTokenCounts(counts)
  }, [tokens])

  const generateTokens = (type) => {
    const newTokens = Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
      type,
      length: Math.floor(Math.random() * 6 + 2),
      id: uuidv4()
    }))
    
    setTokens(prev => {
      const updated = [...prev, ...newTokens]
      const totalLength = updated.reduce((sum, t) => sum + t.length, 0)
      // Remove oldest tokens if over context size
      return totalLength > contextSize 
        ? updated.slice(-Math.floor(contextSize / 2)) 
        : updated
    })
  }

  return (
    <div className="app">
      <h1>LLM Token Simulator</h1>
      <div className="simulator-container">
        <TokenPlate tokens={tokens} contextSize={contextSize} />
        <div className="controls">
          <select 
            value={contextSize} 
            onChange={(e) => setContextSize(Number(e.target.value))}
          >
            {CONTEXT_SIZES.map(size => (
              <option key={size} value={size}>{size.toLocaleString()} tokens</option>
            ))}
          </select>
          <button onClick={() => generateTokens('user')}>Ask LLM</button>
          <button onClick={() => generateTokens('response')}>Add Response</button>
          <button onClick={() => setTokens([])}>Reset</button>
        </div>
        <TokenMeter counts={tokenCounts} total={contextSize} />
      </div>
    </div>
  )
}

export default App
