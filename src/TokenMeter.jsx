export default function TokenMeter({ counts, total }) {
  const used = counts.system + counts.user + counts.response
  const percentage = Math.min((used / total) * 100, 100)

  const getBackground = () => {
    if (percentage >= 90) return '#ff4444'
    if (percentage >= 80) return '#ffa500'
    if (percentage >= 50) return '#ffdd00'
    return '#f0f0f0'
  }

  return (
    <div className="token-meter">
      <div 
        className="meter-bar"
        style={{ 
          background: getBackground(),
          height: '25px',
          margin: '10px 0'
        }}
      >
        <div
          className="system-fill"
          style={{
            width: `${(counts.system / total) * 100}%`,
            height: '100%',
            backgroundColor: '#2a5bd7'
          }}
        />
        {/* Similar for user and response fills */}
      </div>
      <div className="token-counts">
        System: {counts.system} | User: {counts.user} | Response: {counts.response} | Free: {total - used}
      </div>
    </div>
  )
}
