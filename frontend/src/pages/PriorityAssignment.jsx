import React, { useEffect, useState } from 'react'
import { Flag, BrainCircuit, Loader2 } from 'lucide-react'
import api from '../api/client'
import PriorityMatrix from '../components/PriorityMatrix'

function scoreLabel(score) {
  if (score >= 0.7) return { text: 'Critical', tone: 'bg-rose-50 text-rose-600' }
  if (score >= 0.5) return { text: 'Urgent', tone: 'bg-amber-50 text-amber-700' }
  if (score >= 0.3) return { text: 'Important', tone: 'bg-slate-100 text-slate-700' }
  return { text: 'Routine', tone: 'bg-emerald-50 text-emerald-700' }
}

export default function PriorityAssignment() {
  const [cases, setCases] = useState([])
  const [matrix, setMatrix] = useState(null)
  const [mlStatus, setMlStatus] = useState(null)
  const [training, setTraining] = useState(false)
  const [trainMsg, setTrainMsg] = useState('')

  const loadAll = () => {
    api.getCauseList(50).then(setCases).catch(() => setCases([]))
    api.getPriorityMatrix().then(setMatrix).catch(() => setMatrix(null))
    api.getMlStatus().then(setMlStatus).catch(() => setMlStatus(null))
  }

  useEffect(() => { loadAll() }, [])

  const handleTrain = async () => {
    setTraining(true)
    setTrainMsg('')
    try {
      const res = await api.trainMlModel()
      setTrainMsg(`Model trained on ${res.trained_on_rows} rows (avg error: ${res.mean_absolute_error_days} days).`)
      loadAll()
    } catch (e) {
      setTrainMsg(e?.response?.data?.detail || 'Training failed. Generate synthetic_training_data.csv first.')
    } finally {
      setTraining(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrainCircuit className={`w-6 h-6 ${mlStatus?.ml_model_trained ? 'text-emerald-600' : 'text-ink/30'}`} />
          <div>
            <p className="text-sm font-semibold text-ink">
              {mlStatus?.ml_model_trained ? 'ML Priority Model: Active' : 'ML Priority Model: Not trained (using rule-based scoring)'}
            </p>
            <p className="text-xs text-ink/50">LightGBM regressor predicting days-to-disposal → priority score</p>
          </div>
        </div>
        <button
          onClick={handleTrain}
          disabled={training}
          className="bg-navy text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-light disabled:opacity-50 flex items-center gap-2"
        >
          {training && <Loader2 className="w-4 h-4 animate-spin" />}
          {training ? 'Training...' : mlStatus?.ml_model_trained ? 'Re-train Model' : 'Train ML Model'}
        </button>
      </div>
      {trainMsg && <p className="text-sm text-navy bg-gold/10 rounded-lg px-4 py-2">{trainMsg}</p>}

      <PriorityMatrix matrix={matrix} />

      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <Flag className="w-5 h-5 text-gold" /> Full Priority-Ranked Cause List
        </h3>
        {cases.length === 0 ? (
          <p className="text-sm text-ink/40 italic">No pending cases found — upload a dataset from Case Intake first.</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] text-ink/40 uppercase">
                <th className="pb-2">Rank</th>
                <th className="pb-2">Case ID</th>
                <th className="pb-2">Title</th>
                <th className="pb-2">Type</th>
                <th className="pb-2">Stage</th>
                <th className="pb-2">Priority</th>
                <th className="pb-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c, i) => {
                const label = scoreLabel(c.priority_score)
                return (
                  <tr key={c.case_id} className="border-t border-black/5">
                    <td className="py-2.5 text-ink/50">{i + 1}</td>
                    <td className="py-2.5 text-ink/70">{c.case_id}</td>
                    <td className="py-2.5 font-medium text-ink">{c.title}</td>
                    <td className="py-2.5 text-ink/60">{c.case_type}</td>
                    <td className="py-2.5 text-ink/60">{c.stage}</td>
                    <td className="py-2.5">
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${label.tone}`}>{label.text}</span>
                    </td>
                    <td className="py-2.5 font-semibold text-ink">{c.priority_score.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
