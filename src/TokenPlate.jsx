import { useTransition, animated } from '@react-spring/web'

export default function TokenPlate({ tokens, contextSize }) {
  const transitions = useTransition(tokens, {
    keys: token => token.id,
    from: { opacity: 0, transform: 'translateY(20px)' },
    enter: { opacity: 1, transform: 'translateY(0px)' },
    leave: { opacity: 0, transform: 'translateY(-20px)' },
    config: { tension: 220, friction: 20 }
  })

  return (
    <div className="token-plate" style={{ maxWidth: `${contextSize / 2}px` }}>
      <div className="system-block">
        {tokens.filter(t => t.type === 'system').map(token => (
          <animated.div 
            key={token.id}
            className="token-brick system"
            style={{ 
              width: `${token.length * 8}px`,
              opacity: 1,
              transform: 'translateY(0px)'
            }}
          >
            {token.length}
          </animated.div>
        ))}
      </div>
      <div className="content-area">
        {transitions((style, token) => (
          <animated.div
            className={`token-brick ${token.type}`}
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
  )
}
