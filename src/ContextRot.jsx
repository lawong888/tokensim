// ContextRot.jsx
// "Context Rot" warning surface. Fires only when context is LOST
// (autocompact/eviction drops old messages). Shows both:
//   • a persistent, color-coded severity badge (overall health), and
//   • a transient toast at the instant each loss happens.
//
// The `rot` object is owned by App.jsx and shaped as:
//   { events, messagesLost, tokensLost, severity }

import { ROT_META, fmtTokens } from './contextModel'
import { useT } from './i18n'

export function ContextRotBadge({ rot }) {
  const { t } = useT()
  const meta = ROT_META[rot.severity]
  const rotting = rot.severity !== 'none'

  return (
    <div
      className={`rot-badge ${rot.severity}`}
      style={{ borderColor: meta.color, color: meta.color }}
      title={t('rot.tooltip')}
    >
      <span className="rot-icon">{rotting ? '⚠' : '✓'}</span>
      <span className="rot-title">{t('rot.title')}: {t('rot.' + rot.severity)}</span>
      {rotting && (
        <span className="rot-detail">
          {t('rot.detail', { count: rot.messagesLost, tokens: fmtTokens(rot.tokensLost) })}
        </span>
      )}
    </div>
  )
}

export function ContextRotToast({ toast }) {
  const { t } = useT()
  if (!toast) return null
  const summary = toast.mode === 'summary'
  return (
    <div className={`rot-toast ${summary ? 'summary' : ''}`} key={toast.id}>
      {summary ? '🗜️ ' : '⚠ '}
      {t(summary ? 'toast.compacted' : 'toast.lost', { count: toast.count, tokens: fmtTokens(toast.tokens) })}
    </div>
  )
}
