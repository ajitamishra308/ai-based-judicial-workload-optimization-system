import React from 'react'
import { ShieldCheck, XSquare, ClipboardList, TriangleAlert } from 'lucide-react'

export default function PriorityMatrix({ matrix }) {
  const quadrants = [
    { key: 'important', label: 'Important', sub: 'Not Urgent', icon: ShieldCheck, tone: 'bg-slate-100 text-slate-700' },
    { key: 'critical', label: 'Critical', sub: 'Act Now', icon: XSquare, tone: 'bg-rose-50 text-rose-600' },
    { key: 'routine', label: 'Routine', sub: 'Monitor', icon: ClipboardList, tone: 'bg-emerald-50 text-emerald-700' },
    { key: 'urgent', label: 'Urgent', sub: 'Schedule Soon', icon: TriangleAlert, tone: 'bg-amber-50 text-amber-700' },
  ]

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <h3 className="text-sm font-bold tracking-wide text-ink/70 uppercase mb-4">Priority Matrix</h3>
      <div className="flex gap-3">
        <div className="flex flex-col justify-between items-center text-[10px] text-ink/40 py-2">
          <span>High</span>
          <span className="[writing-mode:vertical-rl] rotate-180 font-semibold tracking-widest">IMPACT</span>
          <span>Low</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {quadrants.map(({ key, label, sub, icon: Icon, tone }) => (
            <div key={key} className={`rounded-xl p-4 ${tone}`}>
              <Icon className="w-5 h-5 mb-3" strokeWidth={1.5} />
              <p className="text-xs font-semibold leading-tight">{label}</p>
              <p className="text-xs leading-tight mb-2">{sub}</p>
              <p className="font-display text-2xl font-bold">{matrix?.[key] ?? 0}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-ink/40 mt-2 pl-8">
        <span>Low</span>
        <span className="font-semibold tracking-widest">URGENCY</span>
        <span>High</span>
      </div>
    </div>
  )
}
