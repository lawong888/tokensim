// TokenMeter.jsx
// A single horizontal utilization bar, now data-driven: one segment per
// category (in CATEGORIES order) sized by its share of the window. Keeps the
// original "Sent to LLM" animation.

export default function TokenMeter({ breakdown, total, isSendingRequest, autoAsk }) {
  // Everything except free space + reserved buffer counts as "used".
  const used = breakdown
    .filter((c) => !c.derived && !c.reserved)
    .reduce((s, c) => s + c.tokens, 0)
  const percentage = total ? Math.min((used / total) * 100, 100) : 0

  const trackColor =
    percentage >= 90 ? '#ff4444' : percentage >= 80 ? '#ffa500' : percentage >= 50 ? '#ffdd00' : '#f0f0f0'

  return (
    <div className="token-meter">
      <div
        className={`meter-bar ${isSendingRequest && !autoAsk ? 'slide-out' : ''}`}
        style={{ background: trackColor }}
      >
        {breakdown.map((c) => (
          <div
            key={c.key}
            className="meter-segment"
            style={{
              width: `${total ? (c.tokens / total) * 100 : 0}%`,
              background: c.derived ? 'transparent' : c.color,
              opacity: c.reserved ? 0.35 : 1,
              height: '100%',
              transition: 'width 0.3s ease',
            }}
            title={`${c.label}: ${c.tokens.toLocaleString()} tokens`}
          />
        ))}
      </div>
      <div className={`sent-to-llm-text ${autoAsk ? 'visible pulsing' : isSendingRequest ? 'visible' : ''}`}>
        Sent to LLM
      </div>
    </div>
  )
}
