import { useEffect, useState } from 'react'
import UploadBox from '../components/UploadBox.jsx'
import ConfidenceBar from '../components/ConfidenceBar.jsx'
import ModelInfoCard from '../components/ModelInfoCard.jsx'
import TechBadges from '../components/TechBadges.jsx'
import { predictImage, fetchModelInfo } from '../api.js'

const LOW_CONFIDENCE_THRESHOLD = 0.5
const UNCERTAIN_GAP_THRESHOLD = 0.15

function getConfidenceNotice(topPredictions) {
  const [top1, top2] = topPredictions
  if (top1.confidence < LOW_CONFIDENCE_THRESHOLD) {
    return 'Low confidence — the model is not sure about this prediction.'
  }
  if (top2 && top1.confidence - top2.confidence < UNCERTAIN_GAP_THRESHOLD) {
    return `Model uncertain between ${top1.label} and ${top2.label}.`
  }
  return null
}

export default function Analyzer() {
  const [previewUrl, setPreviewUrl] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [modelInfo, setModelInfo] = useState(null)

  useEffect(() => {
    fetchModelInfo().then(setModelInfo).catch(() => {})
  }, [])

  async function handleFileSelected(selectedFile) {
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setResult(null)
    setError(null)
    setLoading(true)

    try {
      const data = await predictImage(selectedFile)
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setPreviewUrl(null)
    setResult(null)
    setError(null)
  }

  const notice = result ? getConfidenceNotice(result.top_predictions) : null

  return (
    <div className="page page-wide">
      <header className="hero">
        <h1 className="page-title">AI Image Analyzer</h1>
        <p className="hero-subtitle">
          Upload an image and let a fine-tuned deep learning model classify its material.
        </p>
        <TechBadges />
      </header>

      <div className="analyzer-grid">
        <div className="card">
          <h2 className="card-title">Upload</h2>
          <UploadBox onFileSelected={handleFileSelected} onError={setError} />

          {previewUrl && (
            <>
              <img src={previewUrl} alt="uploaded preview" className="preview-image" />
              <button type="button" className="btn-secondary" onClick={handleReset}>
                Analyze another image
              </button>
            </>
          )}
        </div>

        <div className="card">
          <h2 className="card-title">AI Result</h2>

          {!previewUrl && !loading && (
            <p className="status-text">上傳圖片後,分析結果會顯示在這裡</p>
          )}

          {loading && <p className="status-text">分析中...</p>}
          {error && <p className="status-text error-text">發生錯誤:{error}</p>}

          {result && (
            <>
              <div className="result-summary">
                <div className="result-label">{result.prediction}</div>
                <div className="result-confidence">
                  {(result.confidence * 100).toFixed(2)}%
                </div>
              </div>

              <div className="confidence-track large">
                <div
                  className="confidence-fill"
                  style={{ width: `${(result.confidence * 100).toFixed(2)}%` }}
                />
              </div>

              {notice && <div className="notice-banner">{notice}</div>}

              <h3 className="card-subtitle">Top Predictions</h3>
              {result.top_predictions.map((p) => (
                <ConfidenceBar key={p.label} label={p.label} confidence={p.confidence} />
              ))}

              <div className="divider" />

              <ModelInfoCard modelInfo={modelInfo} inferenceTimeMs={result.inference_time_ms} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
