// ContextBreakdown.jsx
// The /context text panel: one row per category with glyph, label, token
// count and percentage, plus a header total whose color reflects how full
// the window is (the fullness signal the standalone meter used to carry).

import { fmtTokens } from './contextModel'
import { useT } from './i18n'

function fullnessColor(pct) {
  if (pct >= 90) return '#ff4444'
  if (pct >= 80) return '#ffa500'
  if (pct >= 50) return '#d0a000'
  return '#1f9d2f'
}

export default function ContextBreakdown({ breakdown, total }) {
  const { t } = useT()
  const used = breakdown
    .filter((c) => !c.derived && !c.reserved)
    .reduce((s, c) => s + c.tokens, 0)
  const pct = total ? Math.round((used / total) * 100) : 0

  return (
    <div className="context-breakdown">
      <div className="breakdown-header">
        {t('breakdown.title')}
        <span className="breakdown-total" style={{ color: fullnessColor(pct) }}>
          {fmtTokens(used)}/{fmtTokens(total)} ({pct}%)
        </span>
      </div>
      <ul className="breakdown-list">
        {breakdown.map((c) => (
          <li key={c.key} className="breakdown-row">
            <span className="breakdown-swatch" style={{ background: c.color }} />
            <span className="breakdown-glyph">{c.glyph}</span>
            <span className="breakdown-label">{t('cat.' + c.key)}</span>
            <span className="breakdown-tokens">{fmtTokens(c.tokens)}</span>
            <span className="breakdown-pct">{c.pct.toFixed(1)}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
