import React, { useEffect, useState } from 'react'
import { Users2, Loader2, Wand2 } from 'lucide-react'
import api from '../api/client'

function loadColor(pct) {
  if (pct >= 75) return 'bg-rose-500'
  if (pct >= 50) return 'bg-gold'
  return 'bg-emerald-500'
}

export default function WorkloadOptimization() {
  const [judges, setJudges] = useState([])
  const [assigning, setAssigning] = useState(false)
  const [message, setMessage] = useState('')

  const load = () => api.getJudges().then(setJudges).catch(() => setJudges([]))

  useEffect(() => { load() }, [])

  const handleSeed = async () => {
    await api.seedDemoJudges()
    load()
  }

  const handleAutoAssign = async () => {
    setAssigning(true)
    setMessage('')
    try {
      const res = await api.autoAssignCases()
      setMessage(res.message || `Assigned ${res.assigned} cases across ${res.judges_used} judges.`)
      load()
    } catch (e) {
      setMessage('Auto-assign failed. Make sure judges and pending cases exist.')
    } finally {
      setAssigning(false)
    }
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2">
            <Users2 className="w-5 h-5 text-gold" /> Judicial Workload Optimization
          </h3>
          <div className="flex gap-2">
            {judges.length === 0 && (
              <button onClick={handleSeed} className="text-sm border border-black/10 rounded-lg px-4 py-2 text-ink/60">
                Add Demo Judges
              </button>
            )}
            <button
              onClick={handleAutoAssign}
              disabled={assigning}
              className="bg-navy text-cream text-sm font-medium px-4 py-2 rounded-lg hover:bg-navy-light disabled:opacity-50 flex items-center gap-2"
            >
              {assigning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {assigning ? 'Assigning...' : 'Auto-Assign Pending Cases'}
            </button>
          </div>
        </div>
        <p className="text-sm text-ink/50 mb-4">
          Rule-based load balancer: ranks pending cases by priority, then assigns each to whichever
          active judge currently has the lightest load. (8th-sem: replace with a trained assignment model.)
        </p>
        {message && <p className="text-sm text-navy bg-gold/10 rounded-lg px-4 py-2 mb-4">{message}</p>}

        {judges.length === 0 ? (
          <p className="text-sm text-ink/40 italic">No judges yet — click "Add Demo Judges" to get started.</p>
        ) : (
          <div className="space-y-4">
            {judges.map((j) => (
              <div key={j.id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-ink">{j.name} <span className="text-ink/40 font-normal">· {j.specialization}</span></span>
                  <span className="text-ink/60">{j.assigned_cases} cases ({j.load_pct}%)</span>
                </div>
                <div className="w-full h-3 bg-black/5 rounded-full overflow-hidden">
                  <div className={`h-full ${loadColor(j.load_pct)}`} style={{ width: `${j.load_pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
