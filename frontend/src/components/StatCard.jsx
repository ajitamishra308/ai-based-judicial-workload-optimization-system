import React from 'react'

const ICON_BG = {
  navy: 'bg-navy',
  green: 'bg-emerald-600',
  red: 'bg-rose-500',
  purple: 'bg-indigo-400',
}

export default function StatCard({ icon: Icon, label, value, delta, color = 'navy' }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-black/5 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center ${ICON_BG[color]}`}>
          <Icon className="w-5 h-5 text-white" strokeWidth={1.75} />
        </div>
        <p className="text-xs font-semibold tracking-wide text-ink/50 uppercase">{label}</p>
      </div>
      <p className="font-display text-3xl font-bold text-ink">{value}</p>
      {delta && <p className="text-xs text-emerald-600 mt-1 font-medium">{delta}</p>}
    </div>
  )
}
