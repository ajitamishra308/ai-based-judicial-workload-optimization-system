import React, { useEffect, useState } from 'react'
import { UserRound, Plus, Trash2 } from 'lucide-react'
import api from '../api/client'

const EMPTY = { name: '', court: 'District Court', specialization: 'General', max_daily_capacity: 8 }

export default function JudgesStaff() {
  const [judges, setJudges] = useState([])
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')

  const load = () => api.getJudges().then(setJudges).catch(() => setJudges([]))
  useEffect(() => { load() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) return
    try {
      await api.addJudge({ ...form, max_daily_capacity: Number(form.max_daily_capacity) })
      setForm(EMPTY)
      load()
    } catch (e) {
      setError(e?.response?.data?.detail || 'Could not add judge')
    }
  }

  const handleDelete = async (id) => {
    await api.deleteJudge(id)
    load()
  }

  return (
    <div className="p-8 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <UserRound className="w-5 h-5 text-gold" /> Add Judge
        </h3>
        <form onSubmit={handleAdd} className="grid grid-cols-5 gap-3 items-end">
          <div className="col-span-2">
            <label className="text-xs text-ink/50">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" placeholder="Judge A. Sharma" />
          </div>
          <div>
            <label className="text-xs text-ink/50">Court</label>
            <input value={form.court} onChange={(e) => setForm({ ...form, court: e.target.value })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50">Specialization</label>
            <select value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm">
              {['General', 'Criminal', 'Civil', 'Family', 'Property'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-ink/50">Daily Cap.</label>
              <input type="number" value={form.max_daily_capacity}
                     onChange={(e) => setForm({ ...form, max_daily_capacity: e.target.value })}
                     className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
            </div>
            <button type="submit" className="bg-navy text-cream px-3 py-2 rounded-lg h-fit mt-auto">
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </form>
        {error && <p className="text-sm text-rose-600 mt-2">{error}</p>}
      </div>

      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="text-sm font-bold tracking-wide text-ink/70 uppercase mb-4">All Judges</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] text-ink/40 uppercase">
              <th className="pb-2">Name</th><th className="pb-2">Court</th>
              <th className="pb-2">Specialization</th><th className="pb-2">Assigned Cases</th>
              <th className="pb-2">Load</th><th></th>
            </tr>
          </thead>
          <tbody>
            {judges.map((j) => (
              <tr key={j.id} className="border-t border-black/5">
                <td className="py-2.5 font-medium text-ink">{j.name}</td>
                <td className="py-2.5 text-ink/60">{j.court}</td>
                <td className="py-2.5 text-ink/60">{j.specialization}</td>
                <td className="py-2.5 text-ink/60">{j.assigned_cases}</td>
                <td className="py-2.5 text-ink/60">{j.load_pct}%</td>
                <td className="py-2.5 text-right">
                  <button onClick={() => handleDelete(j.id)} className="text-rose-500 hover:text-rose-700">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {judges.length === 0 && <p className="text-sm text-ink/40 italic mt-2">No judges added yet.</p>}
      </div>
    </div>
  )
}
