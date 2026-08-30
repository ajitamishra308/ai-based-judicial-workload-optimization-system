import React from 'react'

const PRIORITY_STYLE = {
  High: 'bg-rose-50 text-rose-600',
  Medium: 'bg-amber-50 text-amber-700',
  Low: 'bg-emerald-50 text-emerald-700',
}
const STATUS_STYLE = {
  Completed: 'bg-emerald-50 text-emerald-700',
  'In Progress': 'bg-blue-50 text-blue-600',
  Pending: 'bg-slate-100 text-slate-600',
}

export default function RecentCases({ cases }) {
  return (
    <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-wide text-ink/70 uppercase">Recent Cases</h3>
        <button className="text-xs font-medium text-ink/60 border border-black/10 rounded-lg px-3 py-1.5">View All Cases →</button>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] text-ink/40 uppercase">
            <th className="pb-2 font-medium">Case ID</th>
            <th className="pb-2 font-medium">Case Title</th>
            <th className="pb-2 font-medium">Category</th>
            <th className="pb-2 font-medium">Priority</th>
            <th className="pb-2 font-medium">Status</th>
            <th className="pb-2 font-medium">Assigned To</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => (
            <tr key={c.case_id} className="border-t border-black/5">
              <td className="py-3 text-ink/70">{c.case_id}</td>
              <td className="py-3 font-medium text-ink">{c.title}</td>
              <td className="py-3 text-ink/60">{c.case_type}</td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${PRIORITY_STYLE[c.priority] || 'bg-slate-100 text-slate-600'}`}>
                  {c.priority}
                </span>
              </td>
              <td className="py-3">
                <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLE[c.status] || 'bg-slate-100 text-slate-600'}`}>
                  {c.status}
                </span>
              </td>
              <td className="py-3 text-ink/60">{c.assigned_to}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
