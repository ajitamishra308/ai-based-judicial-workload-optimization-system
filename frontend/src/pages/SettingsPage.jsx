import React, { useState } from 'react'
import { Settings as SettingsIcon, Save } from 'lucide-react'

const DEFAULTS = {
  courtName: 'District Court',
  adminEmail: 'admin@court.gov.in',
  clusterCount: 5,
  criticalThreshold: 0.7,
}

export default function SettingsPage() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('nyaya_settings')
    return saved ? JSON.parse(saved) : DEFAULTS
  })
  const [saved, setSaved] = useState(false)

  const handleSave = (e) => {
    e.preventDefault()
    localStorage.setItem('nyaya_settings', JSON.stringify(settings))
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8">
      <div className="bg-white rounded-2xl p-6 border border-black/5 shadow-sm max-w-xl">
        <h3 className="font-display text-lg font-semibold text-ink flex items-center gap-2 mb-4">
          <SettingsIcon className="w-5 h-5 text-gold" /> System Settings
        </h3>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="text-xs text-ink/50">Court Name</label>
            <input value={settings.courtName} onChange={(e) => setSettings({ ...settings, courtName: e.target.value })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50">Admin Email</label>
            <input value={settings.adminEmail} onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50">Default Cluster Count (AI Triage)</label>
            <input type="number" min="2" max="15" value={settings.clusterCount}
                   onChange={(e) => setSettings({ ...settings, clusterCount: Number(e.target.value) })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
          </div>
          <div>
            <label className="text-xs text-ink/50">Critical Priority Threshold (0-1)</label>
            <input type="number" min="0" max="1" step="0.05" value={settings.criticalThreshold}
                   onChange={(e) => setSettings({ ...settings, criticalThreshold: Number(e.target.value) })}
                   className="w-full mt-1 px-3 py-2 border border-black/10 rounded-lg text-sm" />
          </div>
          <button type="submit" className="bg-navy text-cream text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2">
            <Save className="w-4 h-4" /> Save Settings
          </button>
          {saved && <p className="text-sm text-emerald-600">Saved!</p>}
        </form>
      </div>
    </div>
  )
}
