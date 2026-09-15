export default function ModelInfoCard({ modelInfo, inferenceTimeMs }) {
  if (!modelInfo) return null

  const rows = [
    { label: 'Model', value: modelInfo.model_name },
    { label: 'Framework', value: modelInfo.framework },
    { label: 'Input Size', value: `${modelInfo.input_size} × ${modelInfo.input_size}` },
    { label: 'Classes', value: modelInfo.num_classes },
    {
      label: 'Inference Time',
      value: inferenceTimeMs != null ? `${inferenceTimeMs.toFixed(0)} ms` : '—',
    },
  ]

  return (
    <div className="model-info">
      <h3 className="card-subtitle">Model Info</h3>
      <dl className="model-info-grid">
        {rows.map((row) => (
          <div key={row.label} className="model-info-row">
            <dt>{row.label}</dt>
            <dd>{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}
