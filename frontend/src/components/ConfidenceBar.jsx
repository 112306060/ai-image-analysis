export default function ConfidenceBar({ label, confidence }) {
  const percent = (confidence * 100).toFixed(2)

  return (
    <div className="confidence-row">
      <div className="confidence-row-header">
        <span className="confidence-label">{label}</span>
        <span className="confidence-value">{percent}%</span>
      </div>
      <div className="confidence-track">
        <div className="confidence-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
