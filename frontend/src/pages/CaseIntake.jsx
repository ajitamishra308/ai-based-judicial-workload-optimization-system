import React, { useState, useRef } from 'react'
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import api from '../api/client'

export default function CaseIntake() {
  const [file, setFile] = useState(null)
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('idle') // idle | uploading | done | error
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const inputRef = useRef(null)

  const handleFile = (f) => {
    if (!f) return
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Please choose a .csv file')
      return
    }
    setError('')
    setFile(f)
    setStatus('idle')
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) return
    setStatus('uploading')
    setProgress(0)
    try {
      const data = await api.uploadDataset(file, setProgress)
      setResult(data)
      setStatus('done')
    } catch (e) {
      setError(e?.response?.data?.detail || 'Upload failed. Is the backend running on :8000?')
      setStatus('error')
    }
  }

  return (
    <div className="max-w-3xl">
      <div className="bg-white rounded-2xl p-8 border border-black/5 shadow-sm">
        <h3 className="font-display text-xl font-semibold text-ink mb-1">Add Your Dataset</h3>
        <p className="text-sm text-ink/50 mb-6">
          Upload a CSV of court cases (e.g. Supreme Court judgments export, or district-court
          pendency data). Expected columns: case_id, title, petitioner, respondent, court,
          case_type, stage, decision_date, disposal_nature, full_text — extra/missing columns
          are handled automatically.
        </p>

        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => { e.preventDefault(); handleFile(e.dataTransfer.files[0]) }}
          onClick={() => inputRef.current?.click()}
          className="border-2 border-dashed border-gold/40 rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gold/5 transition-colors"
        >
          <UploadCloud className="w-9 h-9 text-gold mb-3" strokeWidth={1.5} />
          <p className="text-sm text-ink/70">
            <span className="font-semibold text-navy">Click to browse</span> or drag & drop your .csv file here
          </p>
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        {file && (
          <div className="mt-5 flex items-center gap-3 bg-cream rounded-lg px-4 py-3">
            <FileSpreadsheet className="w-5 h-5 text-navy shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{file.name}</p>
              <p className="text-xs text-ink/40">{(file.size / 1024).toFixed(1)} KB</p>
            </div>
            <button
              onClick={handleUpload}
              disabled={status === 'uploading'}
              className="bg-navy text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-light disabled:opacity-50 flex items-center gap-2"
            >
              {status === 'uploading' && <Loader2 className="w-4 h-4 animate-spin" />}
              {status === 'uploading' ? `Uploading ${progress}%` : 'Upload & Process'}
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="mt-4 flex items-center gap-2 text-rose-600 text-sm">
            <XCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {status === 'done' && result && (
          <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-5">
            <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-2">
              <CheckCircle2 className="w-5 h-5" /> Dataset processed successfully
            </div>
            <div className="grid grid-cols-4 gap-4 text-sm mt-3">
              <div><p className="text-ink/40 text-xs">Rows in file</p><p className="font-semibold text-ink">{result.rows_in_file}</p></div>
              <div><p className="text-ink/40 text-xs">Inserted</p><p className="font-semibold text-ink">{result.inserted}</p></div>
              <div><p className="text-ink/40 text-xs">Updated</p><p className="font-semibold text-ink">{result.updated}</p></div>
              <div><p className="text-ink/40 text-xs">Skipped</p><p className="font-semibold text-ink">{result.skipped}</p></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
