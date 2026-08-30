import React from 'react'
import { PieChart, Pie, Cell } from 'recharts'
import { UserRound } from 'lucide-react'

function loadColor(pct) {
  if (pct >= 75) return '#e15252'
  if (pct >= 50) return '#c9a227'
  return '#0f1b2d'
}

function loadLabel(pct) {
  if (pct >= 75) return 'Very High Load'
  if (pct >= 60) return 'High Load'
  if (pct >= 40) return 'Medium Load'
  return 'Low Load'
}

function Gauge({ judge, pct, cases }) {
  const color = loadColor(pct)
  const data = [{ value: pct }, { value: 100 - pct }]
  return (
    <div className="flex flex-col items-center text-center">
      <div className="w-16 h-9 bg-navy rounded-t-full flex items-center justify-center mb-1">
        <UserRound className="w-4 h-4 text-gold" />
      </div>
      <p className="text-[10px] font-medium text-ink/50 -mt-1 mb-1">{judge}</p>
      <div className="relative w-20 h-20">
        <PieChart width={80} height={80}>
          <Pie data={data} dataKey="value" startAngle={90} endAngle={-270}
               innerRadius={28} outerRadius={38} stroke="none">
            <Cell fill={color} />
            <Cell fill="#eee7d8" />
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-sm text-ink">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold mt-1" style={{ color }}>{loadLabel(pct)}</p>
      <p className="text-[11px] text-ink/40">{cases} Cases</p>
    </div>
  )
}

export default function WorkloadSnapshot({ judges }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-bold tracking-wide text-ink/70 uppercase">Judicial Workload Snapshot</h3>
        <button className="text-xs border border-black/10 rounded-lg px-3 py-1.5 text-ink/60">This Week</button>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {judges.map((j) => <Gauge key={j.judge} {...j} />)}
      </div>
    </div>
  )
}
