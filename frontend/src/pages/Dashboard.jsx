import React, { useEffect, useState } from 'react'
import { FileText, ClipboardCheck, Flag, Users } from 'lucide-react'
import StatCard from '../components/StatCard'
import TriageOverview from '../components/TriageOverview'
import WorkloadSnapshot from '../components/WorkloadSnapshot'
import PriorityMatrix from '../components/PriorityMatrix'
import RecentCases from '../components/RecentCases'
import api from '../api/client'

// Placeholder judge workload data -- wire to a real /api/judges endpoint later
const SAMPLE_JUDGES = [
  { judge: 'Judge A', pct: 78, cases: 156 },
  { judge: 'Judge A', pct: 62, cases: 124 },
  { judge: 'Judge C', pct: 89, cases: 178 },
  { judge: 'Judge C', pct: 45, cases: 89 },
  { judge: 'Judge C', pct: 58, cases: 116 },
]

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [matrix, setMatrix] = useState(null)
  const [cases, setCases] = useState([])
  const [loading, setLoading] = useState(true)
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    Promise.all([api.getStats(), api.getPriorityMatrix(), api.getCases(5)])
      .then(([s, m, c]) => {
        setStats(s)
        setMatrix(m)
        setCases(c.cases || [])
      })
      .catch(() => setOffline(true))
      .finally(() => setLoading(false))
  }, [])

  const displayCases = cases.length
    ? cases.map((c) => ({
        case_id: c.case_id, title: c.title, case_type: c.case_type,
        priority: c.priority_score > 0.7 ? 'High' : c.priority_score > 0.4 ? 'Medium' : 'Low',
        status: c.disposal_nature === 'Disposed' ? 'Completed' : 'Pending',
        assigned_to: 'Judge A',
      }))
    : []

  return (
    <div className="p-8 space-y-6">
      {offline && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-xl px-4 py-3">
          Backend not reachable at localhost:8000 — showing empty state. Start the FastAPI server
          (<code className="font-mono">uvicorn main:app --reload</code>) and upload a dataset from Case Intake.
        </div>
      )}

      <div className="grid grid-cols-4 gap-5">
        <StatCard icon={FileText} label="Total Cases" value={stats?.total_cases ?? 0} delta="↗ 15.4% this month" color="navy" />
        <StatCard icon={ClipboardCheck} label="Triage Completed" value={stats?.disposed_cases ?? 0} delta="↗ 12.8% this month" color="green" />
        <StatCard icon={Flag} label="High Priority Cases" value={matrix?.critical ?? 0} delta="↗ 9.2% this month" color="red" />
        <StatCard icon={Users} label="Active Judges" value={42} delta="No change" color="purple" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <TriageOverview data={stats?.cases_by_type} total={stats?.total_cases} />
        <WorkloadSnapshot judges={SAMPLE_JUDGES} />
      </div>

      <div className="grid grid-cols-[1fr_1.5fr] gap-5">
        <PriorityMatrix matrix={matrix} />
        <RecentCases cases={displayCases} />
      </div>
    </div>
  )
}
