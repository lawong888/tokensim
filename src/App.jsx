import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { LangContext, makeT } from './i18n'
import TokenPlate from './TokenPlate'
import ContextGrid from './ContextGrid'
import ContextBreakdown from './ContextBreakdown'
import ContextConfigPanel from './ContextConfigPanel'
import { ContextRotBadge, ContextRotToast } from './ContextRot'
import {
  computeBreakdown,
  computeRequestCost,
  compactMessages,
  messageBudget,
  makeMessage,
  realisticProfile,
  rotSeverity,
  sumTokens,
} from './contextModel'
import './App.css'

const CONTEXT_SIZES = [
  { value: 8192, label: '8K' },
  { value: 32768, label: '32K' },
  { value: 128000, label: '128K' },
  { value: 200000, label: '200K' },
  { value: 500000, label: '500K' },
  { value: 1000000, label: '1M' },
]
const EMPTY_ROT = { events: 0, messagesLost: 0, tokensLost: 0, severity: 'none' }
const INITIAL_CONTEXT_SIZE = 200000
const INITIAL_INPUT_PRICE = 0.000003

function App() {
  const [contextSize, setContextSize] = useState(200000)
  const [config, setConfig] = useState(realisticProfile)
  const [messages, setMessages] = useState([])
  const [inputTokenPrice, setInputTokenPrice] = useState(0.000003)
  const [outputTokenPrice, setOutputTokenPrice] = useState(0.000009)
  const [sessionTotalCost, setSessionTotalCost] = useState(0)
  const [lastRequestCost, setLastRequestCost] = useState(0)
  const [sessionCacheSaved, setSessionCacheSaved] = useState(0)
  const [cachingEnabled, setCachingEnabled] = useState(false)
  const [totalTokensGenerated, setTotalTokensGenerated] = useState(0)
  const [requestCount, setRequestCount] = useState(0)
  const [autoAsk, setAutoAsk] = useState(false)
  const [isSendingRequest, setIsSendingRequest] = useState(false)
  const [rot, setRot] = useState(EMPTY_ROT)
  const [toast, setToast] = useState(null)
  const [muted, setMuted] = useState(false)
  const [lang, setLang] = useState('en')
  const t = useMemo(() => makeT(lang), [lang])

  // Refs let the async ask/auto flow read the latest values without
  // recreating the (stable) askLLM callback and resetting the interval.
  const messagesRef = useRef(messages)
  const configRef = useRef(config)
  const contextSizeRef = useRef(contextSize)
  const inputPriceRef = useRef(inputTokenPrice)
  const outputPriceRef = useRef(outputTokenPrice)
  const mutedRef = useRef(muted)
  const toastIdRef = useRef(0)
  const beepCtxRef = useRef(null)
  const cachingRef = useRef(cachingEnabled)
  const cacheWarmRef = useRef(false)

  useEffect(() => { configRef.current = config }, [config])
  useEffect(() => { contextSizeRef.current = contextSize }, [contextSize])
  useEffect(() => { inputPriceRef.current = inputTokenPrice }, [inputTokenPrice])
  useEffect(() => { outputPriceRef.current = outputTokenPrice }, [outputTokenPrice])
  useEffect(() => { mutedRef.current = muted }, [muted])
  useEffect(() => { cachingRef.current = cachingEnabled }, [cachingEnabled])
  // Changing the overhead (or toggling caching) invalidates the cached prefix,
  // so the next billed request pays a fresh cache write.
  useEffect(() => { cacheWarmRef.current = false }, [config, cachingEnabled])

  // Short warning tone via Web Audio — no asset file needed. The AudioContext
  // is created lazily on first use (which follows a user click, satisfying
  // browser autoplay policies).
  const playBeep = useCallback(() => {
    if (mutedRef.current) return
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext
      if (!Ctx) return
      const ctx = beepCtxRef.current || (beepCtxRef.current = new Ctx())
      if (ctx.state === 'suspended') ctx.resume()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'square'
      osc.frequency.value = 660
      const t = ctx.currentTime
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.2, t + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.18)
      osc.start(t)
      osc.stop(t + 0.2)
    } catch {
      /* audio is a nice-to-have; ignore failures */
    }
  }, [])

  const commitMessages = useCallback((next) => {
    messagesRef.current = next
    setMessages(next)
  }, [])

  // Record a context-loss event: bump the running totals, flash a toast, beep.
  const registerRot = useCallback((dropped) => {
    const tokens = sumTokens(dropped)
    setRot((prev) => {
      const merged = {
        events: prev.events + 1,
        messagesLost: prev.messagesLost + dropped.length,
        tokensLost: prev.tokensLost + tokens,
      }
      return { ...merged, severity: rotSeverity(merged) }
    })
    const id = ++toastIdRef.current
    setToast({ id, count: dropped.length, tokens })
    setTimeout(() => setToast((t) => (t && t.id === id ? null : t)), 3500)
    playBeep()
  }, [playBeep])

  // Append messages, run autocompact against the message budget, and
  // optionally bill the completed request.
  const addTurn = useCallback((newMsgs, bill) => {
    setTotalTokensGenerated((p) => p + sumTokens(newMsgs))
    const combined = [...messagesRef.current, ...newMsgs]
    const budget = messageBudget(configRef.current, contextSizeRef.current)
    const { kept, dropped } = compactMessages(combined, budget)
    commitMessages(kept)
    if (dropped.length) registerRot(dropped)
    if (bill) {
      const newOutputTokens = sumTokens(newMsgs.filter((m) => m.role === 'assistant'))
      const { cost, cacheSaved } = computeRequestCost({
        config: configRef.current,
        messages: kept,
        newOutputTokens,
        inputPrice: inputPriceRef.current,
        outputPrice: outputPriceRef.current,
        caching: cachingRef.current,
        cacheWarm: cacheWarmRef.current,
      })
      if (cachingRef.current) cacheWarmRef.current = true // prefix now cached → reads
      setLastRequestCost(cost)
      setSessionTotalCost((p) => p + cost)
      setSessionCacheSaved((p) => p + cacheSaved)
      setRequestCount((p) => p + 1)
    }
  }, [commitMessages, registerRot])

  const askLLM = useCallback(() => {
    setIsSendingRequest(true)
    setTimeout(() => setIsSendingRequest(false), 500)

    // User turn now...
    addTurn([makeMessage('user')], false)

    // ...assistant (sometimes with a bulky tool result) shortly after.
    setTimeout(() => {
      const resp = []
      if (Math.random() < 0.5) resp.push(makeMessage('tool'))
      resp.push(makeMessage('assistant'))
      addTurn(resp, true)
    }, 500)
  }, [addTurn])

  // Restore the full initial start configuration — overhead profile, window
  // size, prices, an empty conversation, and all counters/rot state.
  const resetSimulation = () => {
    setAutoAsk(false)
    setConfig(realisticProfile())
    setContextSize(INITIAL_CONTEXT_SIZE)
    setInputTokenPrice(INITIAL_INPUT_PRICE) // output price re-syncs to 3x via effect
    setCachingEnabled(false)
    commitMessages([]) // clear the conversation completely
    setRot(EMPTY_ROT)
    setToast(null)
    setSessionTotalCost(0)
    setLastRequestCost(0)
    setSessionCacheSaved(0)
    setRequestCount(0)
    setTotalTokensGenerated(0)
  }

  // Growing overhead (more MCP/tools/memory) or a smaller window shrinks the
  // message budget — which can evict conversation even without a new turn.
  useEffect(() => {
    const budget = messageBudget(config, contextSize)
    if (sumTokens(messagesRef.current) > budget) {
      const { kept, dropped } = compactMessages(messagesRef.current, budget)
      commitMessages(kept)
      if (dropped.length) registerRot(dropped)
    }
  }, [config, contextSize, commitMessages, registerRot])

  // Auto Ask LLM.
  useEffect(() => {
    if (!autoAsk) return
    const interval = setInterval(askLLM, 1000)
    return () => clearInterval(interval)
  }, [autoAsk, askLLM])

  // Keep output price at 3x input, matching the original model.
  useEffect(() => {
    setOutputTokenPrice(inputTokenPrice * 3)
  }, [inputTokenPrice])

  const breakdown = computeBreakdown(config, messages, contextSize)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <div className="app">
        <header className="app-header">
          <div className="app-title">
            <h1>{t('app.title')}</h1>
            <span className="subtitle">{t('app.subtitleA')} <code>/context</code>{t('app.subtitleB')}</span>
          </div>
          <ContextRotBadge rot={rot} />
        </header>

        <div className="dashboard">
          {/* LEFT: interactive configuration (scrolls if tall) */}
          <ContextConfigPanel config={config} setConfig={setConfig} />

          {/* RIGHT: the /context view */}
          <div className="context-view">
            <div className="context-top">
              <ContextGrid breakdown={breakdown} total={contextSize} isSendingRequest={isSendingRequest} />
              <ContextBreakdown breakdown={breakdown} total={contextSize} />
            </div>

            {/* Cost impact sits between the window and the conversation so it's
                visible on every Ask LLM. */}
            <div className="billing-pills mid">
              <span className="pill current" title={t('bill.currentTip')}>
                {t('bill.current')} ${lastRequestCost.toFixed(6)}
              </span>
              <span className="pill session" title={t('bill.sessionTip')}>
                {t('bill.session')} ${sessionTotalCost.toFixed(6)} · {requestCount} {t('bill.req')}
              </span>
              {cachingEnabled && (
                <span className="pill saved" title={t('bill.savedTip')}>
                  {t('bill.saved')} ${sessionCacheSaved.toFixed(6)}
                </span>
              )}
              <span className="pill tokens" title={t('bill.tokensTip')}>
                {totalTokensGenerated.toLocaleString()} {t('bill.tok')}
              </span>
            </div>

            <TokenPlate messages={messages} isSendingRequest={isSendingRequest} />
          </div>
        </div>

        {/* Bottom strip: toolbar + language toggle */}
        <div className="bottom-strip">
          <div className="toolbar">
            <label className="ctl">
              {t('ctl.window')}
              <select value={contextSize} onChange={(e) => setContextSize(Number(e.target.value))}>
                {CONTEXT_SIZES.map((size) => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </label>
            <label className="ctl">
              {t('ctl.inPrice')}
              <input
                type="number"
                step="0.000001"
                min="0"
                value={inputTokenPrice}
                onChange={(e) => setInputTokenPrice(Number(e.target.value))}
                className="price-input"
              />
            </label>
            <label className="ctl">
              {t('ctl.outPrice')}
              <input
                type="number"
                step="0.000001"
                min="0"
                value={outputTokenPrice}
                onChange={(e) => setOutputTokenPrice(Number(e.target.value))}
                className="price-input"
              />
            </label>
            <button className="btn-ask" onClick={askLLM} disabled={autoAsk}>{t('ctl.ask')}</button>
            <label className="ctl auto-toggle">
              <input type="checkbox" checked={autoAsk} onChange={(e) => setAutoAsk(e.target.checked)} />
              {t('ctl.auto')}
            </label>
            <label className="ctl auto-toggle" title={t('ctl.cacheTip')}>
              <input type="checkbox" checked={cachingEnabled} onChange={(e) => setCachingEnabled(e.target.checked)} />
              {t('ctl.cache')}
            </label>
            <button className="btn-reset" onClick={resetSimulation}>{t('ctl.reset')}</button>
            <button
              className={`mute-btn ${muted ? 'muted' : ''}`}
              onClick={() => setMuted((m) => !m)}
              title={t('ctl.muteTip')}
            >
              {muted ? '🔇' : '🔊'}
            </button>
          </div>
          <button
            className="lang-btn"
            onClick={() => setLang((l) => (l === 'en' ? 'zh' : 'en'))}
            title="Language / 语言"
          >
            🌐 {t('lang.switch')}
          </button>
        </div>

        <ContextRotToast toast={toast} />
      </div>
    </LangContext.Provider>
  )
}

export default App
