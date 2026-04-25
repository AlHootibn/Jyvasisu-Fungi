import { Bell, Sun, Moon, LogOut, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import clsx from 'clsx'
import { useAuth } from '../../contexts/AuthContext'
import { useTheme } from '../../contexts/ThemeContext'
import { useFarm } from '../../contexts/FarmContext'
import { format } from 'date-fns'

export default function Header({ title }) {
  const { user, logout } = useAuth()
  const { isDark, toggle } = useTheme()
  const { unacknowledgedCount, criticalCount, alerts, lastUpdate } = useFarm()
  const [showAlerts, setShowAlerts] = useState(false)
  const [showUser, setShowUser] = useState(false)
  const navigate = useNavigate()

  const recentAlerts = alerts.filter(a => !a.acknowledged).slice(0, 5)

  return (
    <header className="h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3 shrink-0">
      <h1 className="text-base font-semibold text-slate-100 flex-1">{title}</h1>

      <span className="text-xs text-slate-500 hidden sm:block">
        Updated {format(lastUpdate, 'HH:mm:ss')}
      </span>

      <button onClick={toggle} className="btn-ghost p-2">
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative">
        <button
          onClick={() => { setShowAlerts(p => !p); setShowUser(false) }}
          className="btn-ghost p-2 relative"
        >
          <Bell size={18} />
          {unacknowledgedCount > 0 && (
            <span className={clsx(
              'absolute -top-0.5 -right-0.5 text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full',
              criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
            )}>
              {unacknowledgedCount > 9 ? '9+' : unacknowledgedCount}
            </span>
          )}
        </button>
        {showAlerts && (
          <div className="absolute right-0 top-10 w-80 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-700 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-200">Active Alerts</span>
              <button onClick={() => { navigate('/alerts'); setShowAlerts(false) }} className="text-xs text-farm-400 hover:text-farm-300">View all</button>
            </div>
            {recentAlerts.length === 0 ? (
              <p className="p-4 text-sm text-slate-500 text-center">No active alerts</p>
            ) : (
              <div className="divide-y divide-slate-700 max-h-64 overflow-y-auto">
                {recentAlerts.map(a => (
                  <div key={a.id} className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', a.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400')} />
                      <div>
                        <p className="text-xs text-slate-300">{a.message}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">{a.roomName}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => { setShowUser(p => !p); setShowAlerts(false) }}
          className="flex items-center gap-2 hover:bg-slate-800 px-2 py-1.5 rounded-lg transition-colors"
        >
          <div className="w-7 h-7 rounded-full bg-farm-700 flex items-center justify-center text-farm-200 text-xs font-bold">
            {user?.avatar}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-xs font-medium text-slate-200 leading-tight">{user?.name?.split(' ')[0]}</p>
            <p className="text-[10px] text-slate-500 leading-tight">{user?.role}</p>
          </div>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </button>
        {showUser && (
          <div className="absolute right-0 top-10 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-3 border-b border-slate-700">
              <p className="text-sm font-medium text-slate-200">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full bg-farm-900 text-farm-400 border border-farm-800">{user?.role}</span>
            </div>
            <div className="p-1.5">
              <button
                onClick={() => { navigate('/settings'); setShowUser(false) }}
                className="w-full text-left text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors"
              >
                Settings
              </button>
              <button
                onClick={logout}
                className="w-full text-left text-sm text-red-400 hover:text-red-300 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
