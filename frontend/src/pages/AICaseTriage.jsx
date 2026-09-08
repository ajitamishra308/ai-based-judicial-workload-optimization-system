import React, { useEffect, useState } from 'react'
import { Sparkles, Loader2, FileText, Layers } from 'lucide-react'
import api from '../api/client'

export default function AICaseTriage() {
  const [clusters, setClusters] = useState({})
  const [running, setRunning] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedCase, setSelectedCase] = useState('')
  const [summary, setSummary] = useState('')
  const [summarizing, setSummarizing] = useState(false)

  const loadClusters = () => {
    api.getClusters().then(setClusters).catch(() => setClusters({}))
  }

  useEffect(() => { loadClusters() }, [])

  const handleRunClustering = async () => {
    setRunning(true)
    setMessage('')
    try {
      const res = await api.runClustering(5)
      setMessage(`Grouped ${res.clustered_cases} cases into ${res.n_clusters} clusters.`)
      loadClusters()
    } catch (e) {
      setMessage(e?.response?.data?.detail || 'Clustering failed — make sure cases with text are uploaded.')
    } finally {
      setRunning(false)
    }
  }

  const handleSummarize = async () => {
    if (!selectedCase) return
    setSummarizing(true)
    setSummary('')
    try {
      const res = await api.summarizeCase(selectedCase.trim())
      setSummary(res.summary)
    } catch (e) {
      setSummary(e?.response?.data?.detail || 'Could not summarize this case.')
    } finally {
      setSummarizing(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      {/* Similar-case clustering */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Layers className="w-5 h-5 text-gold" /> Similar-Case Clustering
          </h3>
          <button
            onClick={handleRunClustering}
            disabled={running}
            className="bg-navy text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-light disabled:opacity-50 flex items-center gap-2"
          >
            {running && <Loader2 className="w-4 h-4 animate-spin" />}
            {running ? 'Clustering...' : 'Run AI Clustering'}
          </button>
        </div>
        <p className="text-sm text-ink/50 mb-4">
          Groups cases with similar facts/subject-matter using sentence embeddings + KMeans.
          Run this after uploading a dataset with case text.
        </p>
        {message && <p className="text-sm text-navy bg-gold/10 rounded-lg px-4 py-2 mb-4">{message}</p>}

        {Object.keys(clusters).length === 0 ? (
          <p className="text-sm text-ink/40 italic">No clusters yet — click "Run AI Clustering" above.</p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {Object.entries(clusters).map(([clusterId, cases]) => (
              <div key={clusterId} className="border border-black/10 rounded-xl p-4">
                <p className="text-xs font-bold text-gold uppercase mb-2">Cluster {clusterId}</p>
                <ul className="space-y-1">
                  {cases.map((c) => (
                    <li key={c.case_id} className="text-sm text-ink/70 truncate">• {c.title}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summarization */}
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-2">
          <FileText className="w-5 h-5 text-gold" /> Case Summarization
        </h3>
        <p className="text-sm text-ink/50 mb-4">Enter a Case ID to generate an AI summary of its full text.</p>
        <div className="flex gap-3">
          <input
            value={selectedCase}
            onChange={(e) => setSelectedCase(e.target.value)}
            placeholder="e.g. DL2024001"
            className="flex-1 px-4 py-2 border border-black/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
          <button
            onClick={handleSummarize}
            disabled={summarizing || !selectedCase}
            className="bg-gold text-navy text-sm font-semibold px-5 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
          >
            {summarizing && <Loader2 className="w-4 h-4 animate-spin" />}
            <Sparkles className="w-4 h-4" /> Summarize
          </button>
        </div>
        {summary && (
          <div className="mt-4 bg-cream rounded-xl p-4 text-sm text-ink/80 leading-relaxed">{summary}</div>
        )}
      </div>
    </div>
  )
}
