import { useTransition, animated } from '@react-spring/web'

export default function TokenPlate({ tokens, contextSize, isSendingRequest }) {
  // Separate system tokens from user/response tokens
  const systemTokens = tokens.filter(token => token.type === 'system')
  const userResponseTokens = tokens.filter(token => token.type !== 'system')

  const systemTransitions = useTransition(systemTokens, {
    keys: token => token.id,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    config: { tension: 220, friction: 20 }
  })

  const userResponseTransitions = useTransition(userResponseTokens, {
    keys: token => token.id,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    config: { tension: 220, friction: 20 }
  })

  return (
    <div className="token-plate" style={{ maxWidth: "100%" }}>
      <h3 className="section-title">CONTEXT WINDOW</h3>
      
      <div className="token-plate-content">
        <div className="system-section">
          <h4 className="subsection-title">System Tokens</h4>
          <div className="content-area">
            {systemTransitions((style, token) => (
              <animated.div
                className={`token-brick ${token.type} ${isSendingRequest ? 'sending-flash' : ''}`}
                style={{
                  ...style,
                  width: `${token.length * 8}px`
                }}
              >
                {token.length}
              </animated.div>
            ))}
          </div>
        </div>

        <div className="user-response-section">
          <h4 className="subsection-title">User Prompts and Responses</h4>
          <div className="content-area">
            {userResponseTransitions((style, token) => (
              <animated.div
                className={`token-brick ${token.type} ${isSendingRequest ? 'sending-flash' : ''}`}
                style={{
                  ...style,
                  width: `${token.length * 8}px`
                }}
              >
                {token.length}
              </animated.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
