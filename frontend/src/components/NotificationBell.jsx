import React, { useEffect, useRef, useState } from 'react'
import { Bell, ShieldAlert, AlertTriangle, Info } from 'lucide-react'
import api from '../api/client'

const STYLES = {
  critical: { icon: ShieldAlert, tone: 'text-rose-600' },
  warning: { icon: AlertTriangle, tone: 'text-amber-600' },
  info: { icon: Info, tone: 'text-slate-500' },
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleToggle = () => {
    const next = !open
    setOpen(next)
    if (next) {
      setLoading(true)
      api.getNotifications()
        .then(setAlerts)
        .catch(() => setAlerts([]))
        .finally(() => setLoading(false))
    }
  }

  const count = alerts.filter((a) => a.level !== 'info').length

  return (
    <div className="relative" ref={ref}>
      <button onClick={handleToggle} className="relative">
        <Bell className="w-5 h-5 text-ink/50 dark:text-cream/60" strokeWidth={1.75} />
        {count > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-gold text-navy text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            {count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-navy-light border border-black/10 dark:border-white/10 rounded-xl shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-black/5 dark:border-white/10">
            <p className="text-sm font-semibold text-ink dark:text-cream">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {loading && <p className="text-sm text-ink/40 dark:text-cream/40 px-4 py-4">Loading...</p>}
            {!loading && alerts.length === 0 && (
              <p className="text-sm text-ink/40 dark:text-cream/40 px-4 py-4">No notifications.</p>
            )}
            {!loading && alerts.map((a, i) => {
              const { icon: Icon, tone } = STYLES[a.level] || STYLES.info
              return (
                <div key={i} className="flex items-start gap-2.5 px-4 py-3 border-b border-black/5 dark:border-white/5 last:border-0">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone}`} />
                  <p className="text-sm text-ink/80 dark:text-cream/80">{a.message}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
