import { useState, useEffect } from 'react'
import { useTransition, animated } from '@react-spring/web'
import { v4 as uuidv4 } from 'uuid'
import TokenPlate from './TokenPlate'
import TokenMeter from './TokenMeter'
import './App.css'

const CONTEXT_SIZES = [1024, 2048, 4096, 8192, 32768]

function App() {
  const [contextSize, setContextSize] = useState(4096)
  const [tokens, setTokens] = useState([])
  const [tokenCounts, setTokenCounts] = useState({ system: 0, user: 0, response: 0 })

  // Generate initial system tokens
  useEffect(() => {
    const systemTokens = Array.from({ length: Math.floor(Math.random() * 8 + 12) }, () => ({
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
    console.log('Current tokens:', tokens)
    console.log('Token counts:', counts)
    setTokenCounts(counts)
  }, [tokens])

  const generateTokens = (type) => {
    const newTokens = Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
      type,
      length: Math.floor(Math.random() * 6 + 2),
      id: uuidv4()
    }))
    
    setTokens(prev => {
      // Keep system tokens separate and never evict them
      const systemTokens = prev.filter(token => token.type === 'system')
      const nonSystemTokens = prev.filter(token => token.type !== 'system')
      const updated = [...systemTokens, ...nonSystemTokens, ...newTokens]
      
      // Calculate total length and evict oldest non-system tokens if needed
      let totalLength = updated.reduce((sum, t) => sum + t.length, 0)
      let startIndex = systemTokens.length // Never remove system tokens
      
      // Keep removing oldest non-system tokens until we're under context size
      while (totalLength > contextSize && startIndex < updated.length) {
        totalLength -= updated[startIndex].length
        startIndex++
      }
      
      return [...systemTokens, ...updated.slice(startIndex)]
    })

    // If we just added user tokens, automatically generate response tokens after a short delay
    if (type === 'user') {
      setTimeout(() => {
        const responseTokens = Array.from({ length: Math.floor(Math.random() * 8 + 3) }, () => ({
          type: 'response',
          length: Math.floor(Math.random() * 6 + 2),
          id: uuidv4()
        }))
        
        setTokens(prev => {
          // Keep system tokens separate and never evict them
          const systemTokens = prev.filter(token => token.type === 'system')
          const nonSystemTokens = prev.filter(token => token.type !== 'system')
          const updated = [...systemTokens, ...nonSystemTokens, ...responseTokens]
          
          // Calculate total length and evict oldest non-system tokens if needed
          let totalLength = updated.reduce((sum, t) => sum + t.length, 0)
          let startIndex = systemTokens.length // Never remove system tokens
          
          // Keep removing oldest non-system tokens until we're under context size
          while (totalLength > contextSize && startIndex < updated.length) {
            totalLength -= updated[startIndex].length
            startIndex++
          }
          
          return [...systemTokens, ...updated.slice(startIndex)]
        })
      }, 500)
    }
  }

  const resetSimulation = () => {
    // Generate new random system tokens on reset
    const systemTokens = Array.from({ length: Math.floor(Math.random() * 8 + 12) }, () => ({
      type: 'system',
      length: Math.floor(Math.random() * 4 + 2),
      id: uuidv4()
    }))
    setTokens(systemTokens)
  }

  const used = tokenCounts.system + tokenCounts.user + tokenCounts.response

  return (
    <div className="app">
      <h1>LLM Token Simulator</h1>
      <div className="simulator-container">
        <TokenPlate tokens={tokens} contextSize={contextSize} />
        <div className="token-counts">
          System: {tokenCounts.system} | User: {tokenCounts.user} | Response: {tokenCounts.response} | Free: {contextSize - used}
        </div>
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
          <button onClick={resetSimulation}>Reset</button>
        </div>
        <TokenMeter counts={tokenCounts} total={contextSize} />
      </div>
    </div>
  )
}

export default App
