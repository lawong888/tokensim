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
          margin: '10px 0',
          display: 'flex',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div
          className="meter-segment system"
          style={{
            width: `${(counts.system / total) * 100}%`,
            height: '100%',
            transition: 'width 0.3s ease'
          }}
        />
        <div
          className="meter-segment user"
          style={{
            width: `${(counts.user / total) * 100}%`,
            height: '100%',
            transition: 'width 0.3s ease'
          }}
        />
        <div
          className="meter-segment response"
          style={{
            width: `${(counts.response / total) * 100}%`,
            height: '100%',
            transition: 'width 0.3s ease'
          }}
        />
      </div>
    </div>
  )
}
