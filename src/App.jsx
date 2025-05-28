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
  const [inputTokenPrice, setInputTokenPrice] = useState(0.000003)
  const [outputTokenPrice, setOutputTokenPrice] = useState(0.000009)
  const [sessionTotalCost, setSessionTotalCost] = useState(0)
  const [totalTokensGenerated, setTotalTokensGenerated] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [autoAsk, setAutoAsk] = useState(false)

  // Generate initial system tokens and response
  useEffect(() => {
    const systemTokens = Array.from({ length: Math.floor(Math.random() * 15 + 20) }, () => ({
      type: 'system',
      length: Math.floor(Math.random() * 4 + 2),
      id: uuidv4()
    }))
    
    const initialResponseTokens = Array.from({ length: Math.floor(Math.random() * 8 + 5) }, () => ({
      type: 'response',
      length: Math.floor(Math.random() * 6 + 2),
      id: uuidv4()
    }))
    
    setTokens([...systemTokens, ...initialResponseTokens])
    
    // Calculate initial request cost (entire context)
    const systemTokenCount = systemTokens.reduce((sum, token) => sum + token.length, 0)
    const responseTokenCount = initialResponseTokens.reduce((sum, token) => sum + token.length, 0)
    const initialRequestCost = (systemTokenCount * inputTokenPrice) + (responseTokenCount * outputTokenPrice)
    
    // Set initial session cost and token counts
    setSessionTotalCost(initialRequestCost)
    setTotalTokensGenerated(systemTokenCount + responseTokenCount)
    setRequestCount(1)
  }, [])

  // Auto Ask LLM functionality
  useEffect(() => {
    let interval
    if (autoAsk) {
      interval = setInterval(() => {
        generateTokens('user')
      }, 500)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [autoAsk])

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

  // Update output token price when input price changes
  useEffect(() => {
    setOutputTokenPrice(inputTokenPrice * 3)
  }, [inputTokenPrice])

  // Calculate current request cost (entire context window)
  const calculateCurrentRequestCost = () => {
    const inputTokenCount = tokenCounts.system + tokenCounts.user
    const outputTokenCount = tokenCounts.response
    return (inputTokenCount * inputTokenPrice) + (outputTokenCount * outputTokenPrice)
  }

  const generateTokens = (type) => {
    const newTokens = Array.from({ length: Math.floor(Math.random() * 5 + 1) }, () => ({
      type,
      length: Math.floor(Math.random() * 6 + 2),
      id: uuidv4()
    }))
    
    // Track total tokens generated (for statistics)
    const newTokensCount = newTokens.reduce((sum, token) => sum + token.length, 0)
    setTotalTokensGenerated(prev => prev + newTokensCount)
    
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
        
        // Track total response tokens generated
        const responseTokensCount = responseTokens.reduce((sum, token) => sum + token.length, 0)
        setTotalTokensGenerated(prev => prev + responseTokensCount)
        
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
          
          const finalTokens = [...systemTokens, ...updated.slice(startIndex)]
          
          // Calculate the cost for this complete request (entire final context)
          const finalCounts = finalTokens.reduce((acc, token) => {
            acc[token.type] += token.length
            return acc
          }, { system: 0, user: 0, response: 0 })
          
          const inputTokenCount = finalCounts.system + finalCounts.user
          const outputTokenCount = finalCounts.response
          const requestCost = (inputTokenCount * inputTokenPrice) + (outputTokenCount * outputTokenPrice)
          
          // Add this request's cost to session total
          setSessionTotalCost(prev => prev + requestCost)
          setRequestCount(prev => prev + 1)
          
          return finalTokens
        })
      }, 500)
    }
  }

  const resetSimulation = () => {
    // Turn off auto ask when resetting
    setAutoAsk(false)
    
    // Generate new random system tokens on reset
    const systemTokens = Array.from({ length: Math.floor(Math.random() * 15 + 20) }, () => ({
      type: 'system',
      length: Math.floor(Math.random() * 4 + 2),
      id: uuidv4()
    }))
    
    // Generate initial response tokens for the system
    const initialResponseTokens = Array.from({ length: Math.floor(Math.random() * 8 + 5) }, () => ({
      type: 'response',
      length: Math.floor(Math.random() * 6 + 2),
      id: uuidv4()
    }))
    
    setTokens([...systemTokens, ...initialResponseTokens])
    
    // Reset all costs and counters
    const systemTokenCount = systemTokens.reduce((sum, token) => sum + token.length, 0)
    const responseTokenCount = initialResponseTokens.reduce((sum, token) => sum + token.length, 0)
    const initialRequestCost = (systemTokenCount * inputTokenPrice) + (responseTokenCount * outputTokenPrice)
    
    setSessionTotalCost(initialRequestCost)
    setTotalTokensGenerated(systemTokenCount + responseTokenCount)
    setRequestCount(1)
  }

  const used = tokenCounts.system + tokenCounts.user + tokenCounts.response
  const currentRequestCost = calculateCurrentRequestCost()

  return (
    <div className="app">
      <h1>LLM Token Simulator</h1>
      <div className="simulator-container">
        <TokenPlate tokens={tokens} contextSize={contextSize} />
        <div className="token-counts">
          System: {tokenCounts.system} | User: {tokenCounts.user} | Response: {tokenCounts.response} | Free: {contextSize - used}
        </div>
        <div className="billing-section">
          <div className="cost-display current-request">
            Current Request Cost: ${currentRequestCost.toFixed(6)}
          </div>
          <div className="cost-display session-total">
            Session Total: ${sessionTotalCost.toFixed(6)} ({requestCount} requests)
          </div>
          <div className="cost-display tokens-processed">
            Total Tokens Generated: {totalTokensGenerated.toLocaleString()}
          </div>
        </div>
        <div className="controls">
          <label>
            Context Window Size: 
            <select 
              value={contextSize} 
              onChange={(e) => setContextSize(Number(e.target.value))}
            >
              {CONTEXT_SIZES.map(size => (
                <option key={size} value={size}>{size.toLocaleString()} tokens</option>
              ))}
            </select>
          </label>
          <label>
            Input Token Price: 
            <input
              type="number"
              step="0.000001"
              min="0"
              value={inputTokenPrice}
              onChange={(e) => setInputTokenPrice(Number(e.target.value))}
              placeholder="$0.000003"
              className="price-input"
            />
          </label>
          <label>
            Output Token Price: 
            <input
              type="number"
              step="0.000001"
              min="0"
              value={outputTokenPrice}
              onChange={(e) => setOutputTokenPrice(Number(e.target.value))}
              placeholder="$0.000009"
              className="price-input"
            />
          </label>
          <button onClick={() => generateTokens('user')} disabled={autoAsk}>Ask LLM</button>
          <label className="auto-toggle">
            <input
              type="checkbox"
              checked={autoAsk}
              onChange={(e) => setAutoAsk(e.target.checked)}
            />
            Auto Ask LLM
          </label>
          <button onClick={resetSimulation}>Reset</button>
        </div>
        <TokenMeter counts={tokenCounts} total={contextSize} />
        <div className="legend">
          <div className="legend-item">
            <div className="legend-color system"></div>
            <span>Blue = System Tokens</span>
          </div>
          <div className="legend-item">
            <div className="legend-color user"></div>
            <span>Green = User Query Tokens</span>
          </div>
          <div className="legend-item">
            <div className="legend-color response"></div>
            <span>Purple = LLM Response Tokens</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
