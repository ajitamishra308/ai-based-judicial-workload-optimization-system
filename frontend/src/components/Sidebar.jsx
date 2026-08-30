import React from 'react'
import {
  Scale, LayoutDashboard, FileText, Sparkles, Flag, Users2,
  UserRound, CalendarDays, BarChart3, Bell, Settings, Landmark
} from 'lucide-react'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'intake', label: 'Case Intake', icon: FileText },
  { id: 'triage', label: 'AI Case Triage', icon: Sparkles },
  { id: 'priority', label: 'Priority Assignment', icon: Flag },
  { id: 'workload', label: 'Workload Optimization', icon: Users2 },
  { id: 'judges', label: 'Judges & Staff', icon: UserRound },
  { id: 'calendar', label: 'Calendar & Hearings', icon: CalendarDays },
  { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Sidebar({ activePage, onNavigate }) {
  return (
    <aside className="w-64 bg-navy text-cream flex flex-col shrink-0 min-h-screen">
      <div className="px-6 pt-8 pb-6 border-b border-white/10 flex flex-col items-center text-center">
        <Scale className="w-9 h-9 text-gold mb-2" strokeWidth={1.5} />
        <h1 className="font-display text-lg font-semibold tracking-wide">Court Triage AI</h1>
        <p className="text-xs text-white/50 mt-1">Smart Justice, Efficient Future</p>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const active = activePage === id
          return (
            <button
              key={id}
              onClick={() => onNavigate(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-gold text-navy font-semibold'
                  : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" strokeWidth={1.75} />
              {label}
            </button>
          )
        })}
      </nav>

      <div className="mx-4 mb-4 p-4 rounded-xl bg-white/5 border border-white/10">
        <Landmark className="w-5 h-5 text-gold mb-2" strokeWidth={1.5} />
        <p className="text-xs text-white/60 italic leading-relaxed">
          "Technology supports justice when used for transparency, efficiency and fairness."
        </p>
      </div>
    </aside>
  )
}
