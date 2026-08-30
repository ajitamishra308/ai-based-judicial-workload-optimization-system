import React, { useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import CaseIntake from './pages/CaseIntake'

const PAGE_META = {
  dashboard: { title: 'AI-Based Court Case Triage and Judicial Workload Optimization System', subtitle: null },
  intake: { title: 'Case Intake', subtitle: 'Upload and process new case datasets' },
}

export default function App() {
  const [page, setPage] = useState('dashboard')
  const meta = PAGE_META[page] || { title: 'Coming Soon', subtitle: 'This module is part of the 8th-sem extension' }

  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar activePage={page} onNavigate={setPage} />
      <main className="flex-1">
        <Header title={meta.title} subtitle={meta.subtitle} />
        {page === 'dashboard' && <Dashboard />}
        {page === 'intake' && <div className="p-8"><CaseIntake /></div>}
        {!['dashboard', 'intake'].includes(page) && (
          <div className="p-8 text-ink/40 text-sm">This module isn't wired up yet — add it in src/pages/.</div>
        )}
      </main>
    </div>
  )
}
