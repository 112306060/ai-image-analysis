import { useEffect, useState } from 'react'
import { fetchHistory, resolveImageUrl } from '../api.js'

export default function History() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchHistory()
      .then(setRecords)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h1 className="page-title">Analysis History</h1>

      {loading && <p className="status-text">載入中...</p>}
      {error && <p className="status-text error-text">發生錯誤:{error}</p>}

      {!loading && !error && records.length === 0 && (
        <p className="status-text">還沒有任何分析紀錄</p>
      )}

      {records.length > 0 && (
        <table className="history-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Prediction</th>
              <th>Confidence</th>
              <th>Created At</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>
                  <img
                    src={resolveImageUrl(r.image_url)}
                    alt={r.prediction}
                    className="history-thumb"
                  />
                </td>
                <td>{r.prediction}</td>
                <td>{(r.confidence * 100).toFixed(2)}%</td>
                <td>{new Date(r.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
