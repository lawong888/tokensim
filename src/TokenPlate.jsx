// TokenPlate.jsx
// Animated view of the MESSAGES area (the growing conversation). The full-
// window composition lives in ContextGrid; this keeps the React Spring
// enter/leave animation so eviction is visible message-by-message.
//
// All bricks use the Messages green family (so the strip maps to the green
// "Messages" key in the breakdown); a role emoji distinguishes user / assistant
// / tool without reusing another category's color.

import { useTransition, animated } from '@react-spring/web'
import { MESSAGE_ROLE_COLOR, MESSAGE_ROLE_ICON } from './contextModel'
import { useT } from './i18n'

const ROLES = ['user', 'assistant', 'tool']

export default function TokenPlate({ messages, isSendingRequest }) {
  const { t } = useT()
  const transitions = useTransition(messages, {
    keys: (m) => m.id,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    config: { tension: 220, friction: 20 },
  })

  return (
    <div className="token-plate">
      <div className="msg-head">
        <h4 className="subsection-title">{t('msg.title')}</h4>
        <div className="msg-legend">
          {ROLES.map((r) => (
            <span key={r} className="msg-legend-item">
              <span className="msg-emoji">{MESSAGE_ROLE_ICON[r]}</span> {t('role.' + r)}
            </span>
          ))}
        </div>
      </div>
      <div className="content-area">
        {messages.length === 0 && <span className="config-empty">{t('msg.empty')}</span>}
        {transitions((style, m) => (
          <animated.div
            className={`token-brick ${m.role} ${isSendingRequest ? 'sending-flash' : ''}`}
            style={{
              ...style,
              background: MESSAGE_ROLE_COLOR[m.role],
              // Width still encodes relative message size (~350-1400 tokens),
              // with a minimum so the emoji stays legible.
              width: `${Math.max(24, Math.round(m.length / 30))}px`,
            }}
            title={`${t('role.' + m.role)} · ${m.length} ${t('unit.tokens')}`}
          >
            <span className="brick-emoji">{MESSAGE_ROLE_ICON[m.role]}</span>
          </animated.div>
        ))}
      </div>
    </div>
  )
}
