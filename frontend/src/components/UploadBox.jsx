import { useRef, useState } from 'react'

const MAX_SIZE_MB = 10
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export default function UploadBox({ onFileSelected, onError }) {
  const inputRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)

  function handleFiles(files) {
    const file = files?.[0]
    if (!file) return

    if (!ACCEPTED_TYPES.includes(file.type)) {
      onError?.('不支援的檔案格式,請上傳 JPG、PNG 或 WEBP')
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      onError?.(`檔案太大,請上傳 ${MAX_SIZE_MB}MB 以內的圖片`)
      return
    }

    onFileSelected(file)
  }

  return (
    <div
      className={`upload-box ${isDragging ? 'dragging' : ''}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault()
        setIsDragging(true)
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setIsDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      <svg
        className="upload-icon"
        width="32"
        height="32"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M12 16V4m0 0L7 9m5-5l5 5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <p className="upload-title">拖曳圖片到這裡,或點擊選擇檔案</p>
      <p className="upload-subtitle">JPG · PNG · WEBP,最大 {MAX_SIZE_MB}MB</p>
    </div>
  )
}
