import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import {
  LayoutDashboard, Factory, Cpu, Zap, BarChart3, CheckSquare,
  Package, Leaf, Users, Bell, Settings, ChevronLeft, ChevronRight,
  AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'
import { useFarm } from '../../contexts/FarmContext'

const nav = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farm', label: 'Farm Overview', icon: Factory },
  { path: '/devices', label: 'Devices', icon: Cpu },
  { path: '/automation', label: 'Automation', icon: Zap },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/production', label: 'Production', icon: Leaf },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/alerts', label: 'Alerts', icon: Bell, badge: true },
  { path: '/settings', label: 'Settings', icon: Settings },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const { unacknowledgedCount, criticalCount } = useFarm()
  const location = useLocation()

  return (
    <aside className={clsx(
      'flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 shrink-0',
      collapsed ? 'w-16' : 'w-60'
    )}>
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍄</span>
            <div>
              <p className="text-xs font-bold text-farm-400 leading-tight">JyväSisu Fungi</p>
              <p className="text-[10px] text-slate-500">IoT Management</p>
            </div>
          </div>
        )}
        {collapsed && <span className="text-2xl mx-auto">🍄</span>}
        <button
          onClick={() => setCollapsed(p => !p)}
          className="ml-auto p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {nav.map(({ path, label, icon: Icon, badge }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path)
          const count = badge ? unacknowledgedCount : 0
          return (
            <NavLink
              key={path}
              to={path}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                isActive
                  ? 'bg-farm-900/60 text-farm-400 border border-farm-800'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {!collapsed && count > 0 && (
                <span className={clsx(
                  'ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  criticalCount > 0 ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                )}>
                  {count}
                </span>
              )}
              {collapsed && count > 0 && (
                <span className={clsx(
                  'absolute top-1 right-1 w-2 h-2 rounded-full',
                  criticalCount > 0 ? 'bg-red-500' : 'bg-amber-500'
                )} />
              )}
            </NavLink>
          )
        })}
      </nav>

      {!collapsed && (
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-800">
            <div className="w-2 h-2 rounded-full bg-farm-400 animate-pulse" />
            <span className="text-xs text-slate-400">Live • 3s refresh</span>
          </div>
        </div>
      )}
    </aside>
  )
}
