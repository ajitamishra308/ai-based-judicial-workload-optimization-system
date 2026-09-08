import React, { useEffect, useState } from 'react'
import { Bell, AlertTriangle, Info, ShieldAlert } from 'lucide-react'
import api from '../api/client'

const STYLES = {
  critical: { icon: ShieldAlert, tone: 'bg-rose-50 text-rose-600 border-rose-200' },
  warning: { icon: AlertTriangle, tone: 'bg-amber-50 text-amber-700 border-amber-200' },
  info: { icon: Info, tone: 'bg-slate-50 text-slate-600 border-slate-200' },
}

export default function NotificationsPage() {
  const [alerts, setAlerts] = useState([])

  useEffect(() => {
    api.getNotifications().then(setAlerts).catch(() => setAlerts([]))
  }, [])

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <Bell className="w-5 h-5 text-gold" /> Notifications
        </h3>
        <p className="text-sm text-ink/50 mb-4">
          Auto-generated from current case/judge data — no manual setup needed.
        </p>
        <div className="space-y-3">
          {alerts.map((a, i) => {
            const { icon: Icon, tone } = STYLES[a.level] || STYLES.info
            return (
              <div key={i} className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-sm ${tone}`}>
                <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{a.message}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
