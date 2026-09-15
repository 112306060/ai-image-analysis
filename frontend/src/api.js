const API_BASE = ''

export async function predictImage(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/api/predict`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || 'Prediction failed')
  }

  return res.json()
}

export async function fetchModelInfo() {
  const res = await fetch(`${API_BASE}/api/model-info`)
  if (!res.ok) {
    throw new Error('Failed to load model info')
  }
  return res.json()
}

export async function fetchHistory() {
  const res = await fetch(`${API_BASE}/api/history`)
  if (!res.ok) {
    throw new Error('Failed to load history')
  }
  return res.json()
}

export function resolveImageUrl(imageUrl) {
  return `${API_BASE}${imageUrl}`
}
