import React from 'react'
import { Search, Sun, Bell, UserCircle2, ChevronDown } from 'lucide-react'

export default function Header({ title, subtitle }) {
  return (
    <header className="flex items-center justify-between px-8 py-6 border-b border-black/5">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink leading-snug">{title}</h2>
        {subtitle && <p className="text-sm text-ink/50 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-5">
        <div className="relative">
          <Search className="w-4 h-4 text-ink/40 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            placeholder="Search case ID, name, category..."
            className="pl-9 pr-4 py-2 rounded-lg bg-white border border-black/10 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-gold/40"
          />
        </div>
        <Sun className="w-5 h-5 text-ink/50" strokeWidth={1.75} />
        <div className="relative">
          <Bell className="w-5 h-5 text-ink/50" strokeWidth={1.75} />
          <span className="absolute -top-1.5 -right-1.5 bg-gold text-navy text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">3</span>
        </div>
        <div className="flex items-center gap-2 pl-4 border-l border-black/10">
          <div className="w-8 h-8 rounded-full bg-navy flex items-center justify-center">
            <UserCircle2 className="w-5 h-5 text-gold" />
          </div>
          <div className="text-sm leading-tight">
            <p className="font-medium text-ink">Admin</p>
            <p className="text-xs text-ink/40">Court Administrator</p>
          </div>
          <ChevronDown className="w-4 h-4 text-ink/40" />
        </div>
      </div>
    </header>
  )
}
