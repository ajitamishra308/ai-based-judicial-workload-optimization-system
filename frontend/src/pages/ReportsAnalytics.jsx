import React, { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts'
import api from '../api/client'

function MiniBarChart({ title, data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }))
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <h4 className="text-sm font-bold tracking-wide text-ink/70 uppercase mb-4">{title}</h4>
      {chartData.length === 0 ? (
        <p className="text-sm text-ink/40 italic">No data yet.</p>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#0000000d" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#c9a227" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}

export default function ReportsAnalytics() {
  const [report, setReport] = useState(null)

  useEffect(() => {
    api.getReportsSummary().then(setReport).catch(() => setReport(null))
  }, [])

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <BarChart3 className="w-5 h-5 text-gold" />
        <h3 className="font-display text-lg font-semibold text-ink">Reports & Analytics</h3>
      </div>

      {report?.avg_priority_score != null && (
        <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
          <p className="text-xs text-ink/50 uppercase tracking-wide">Average Priority Score (Pending Cases)</p>
          <p className="font-display text-3xl font-bold text-ink">{report.avg_priority_score}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-5">
        <MiniBarChart title="Cases by Stage" data={report?.by_stage} />
        <MiniBarChart title="Cases by Disposal Status" data={report?.by_disposal} />
        <MiniBarChart title="Cases by Court" data={report?.by_court} />
        <MiniBarChart title="Cases by Cluster (AI Grouping)" data={report?.by_cluster} />
      </div>
    </div>
  )
}
