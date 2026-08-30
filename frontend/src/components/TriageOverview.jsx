import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const COLORS = ['#0f1b2d', '#c9a227', '#3f5a7d', '#8b8ba7', '#c9c4b8']

export default function TriageOverview({ data, total }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <h3 className="text-sm font-bold tracking-wide text-ink/70 uppercase mb-4">Case Triage Overview</h3>
      <div className="flex items-center gap-6">
        <div className="relative w-44 h-44 shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData.length ? chartData : [{ name: 'No data', value: 1 }]}
                dataKey="value"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={2}
                stroke="none"
              >
                {chartData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display text-2xl font-bold text-ink">{total ?? 0}</p>
            <p className="text-[11px] text-ink/40">Total Cases</p>
          </div>
        </div>

        <ul className="flex-1 space-y-2.5">
          {chartData.map((d, i) => {
            const pct = total ? Math.round((d.value / total) * 100) : 0
            return (
              <li key={d.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-ink/70">{d.name}</span>
                </span>
                <span className="font-semibold text-ink">{pct}%</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}
