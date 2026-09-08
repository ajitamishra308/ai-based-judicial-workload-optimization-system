import React, { useEffect, useState } from 'react'
import { CalendarDays } from 'lucide-react'
import api from '../api/client'

export default function CalendarHearings() {
  const [calendar, setCalendar] = useState({})

  useEffect(() => {
    api.getCalendar().then(setCalendar).catch(() => setCalendar({}))
  }, [])

  const dates = Object.keys(calendar).sort()

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <CalendarDays className="w-5 h-5 text-gold" /> Upcoming Hearings
        </h3>
        <p className="text-sm text-ink/50 mb-4">
          Generated from Workload Optimization's auto-assignment — run "Auto-Assign Pending Cases"
          there first if this is empty.
        </p>

        {dates.length === 0 ? (
          <p className="text-sm text-ink/40 italic">No hearings scheduled yet.</p>
        ) : (
          <div className="space-y-5">
            {dates.map((date) => (
              <div key={date}>
                <p className="text-xs font-bold text-gold uppercase mb-2">
                  {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <div className="space-y-2">
                  {calendar[date].map((c) => (
                    <div key={c.case_id} className="flex items-center justify-between bg-cream rounded-lg px-4 py-2.5 text-sm">
                      <div>
                        <span className="font-medium text-ink">{c.title}</span>
                        <span className="text-ink/40 ml-2">({c.case_id} · {c.case_type})</span>
                      </div>
                      <span className="text-ink/60">{c.assigned_judge || 'Unassigned'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
