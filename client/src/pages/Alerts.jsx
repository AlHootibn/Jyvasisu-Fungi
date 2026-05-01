import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const SEVERITY_ICONS = {
  critical: AlertTriangle,
  warning: AlertCircle,
  info: Info,
}

const SEVERITY_STYLES = {
  critical: { border: 'border-red-900/50', bg: 'bg-red-900/10', dot: 'bg-red-500', badge: 'badge-critical' },
  warning: { border: 'border-amber-900/50', bg: 'bg-amber-900/10', dot: 'bg-amber-500', badge: 'badge-warning' },
  info: { border: 'border-blue-900/50', bg: 'bg-blue-900/10', dot: 'bg-blue-500', badge: 'badge-info' },
}

export default function Alerts() {
  const { alerts, acknowledgeAlert, acknowledgeAll, unacknowledgedCount } = useFarm()
  const { canAccess } = useAuth()
  const [filter, setFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [visible, setVisible] = useState(20)

  let filtered = alerts
  if (filter === 'active') filtered = filtered.filter(a => !a.acknowledged)
  if (filter === 'acknowledged') filtered = filtered.filter(a => a.acknowledged)
  if (severityFilter !== 'all') filtered = filtered.filter(a => a.severity === severityFilter)

  const displayed = filtered.slice(0, visible)

  return (
    <Layout title="Alerts & Notifications">
      <div className="space-y-5 max-w-screen-lg">
        <div className="grid grid-cols-3 gap-3">
          <div className="card flex items-center gap-3">
            <AlertTriangle size={20} className="text-red-400" />
            <div><p className="text-xl font-bold text-red-400">{alerts.filter(a => !a.acknowledged && a.severity === 'critical').length}</p><p className="text-xs text-slate-500">Critical</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <AlertCircle size={20} className="text-amber-400" />
            <div><p className="text-xl font-bold text-amber-400">{alerts.filter(a => !a.acknowledged && a.severity === 'warning').length}</p><p className="text-xs text-slate-500">Warnings</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <Bell size={20} className="text-blue-400" />
            <div><p className="text-xl font-bold text-blue-400">{unacknowledgedCount}</p><p className="text-xs text-slate-500">Unread Total</p></div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2 flex-wrap">
            <div className="flex gap-1">
              {['all', 'active', 'acknowledged'].map(f => (
                <button key={f} onClick={() => { setFilter(f); setVisible(20) }} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors', filter === f ? 'bg-farm-700 text-farm-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
                  {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Acknowledged'}
                </button>
              ))}
            </div>
            <div className="flex gap-1">
              {['all', 'critical', 'warning', 'info'].map(s => (
                <button key={s} onClick={() => { setSeverityFilter(s); setVisible(20) }} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors', severityFilter === s ? 'bg-slate-600 text-slate-200' : 'bg-slate-800 text-slate-500 hover:bg-slate-700')}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          {unacknowledgedCount > 0 && canAccess('Farm Manager') && (
            <button onClick={acknowledgeAll} className="btn-secondary flex items-center gap-1.5 text-sm">
              <CheckCheck size={15} /> Acknowledge All
            </button>
          )}
        </div>

        <div className="space-y-2">
          {displayed.map(alert => {
            const Icon = SEVERITY_ICONS[alert.severity] || Info
            const s = SEVERITY_STYLES[alert.severity]
            return (
              <div key={alert.id} className={clsx('flex gap-3 p-4 rounded-xl border transition-all', s.border, !alert.acknowledged ? s.bg : 'bg-slate-900/30 border-slate-800 opacity-60')}>
                <div className="mt-0.5 shrink-0">
                  <Icon size={18} className={clsx(alert.severity === 'critical' ? 'text-red-400' : alert.severity === 'warning' ? 'text-amber-400' : 'text-blue-400')} />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border capitalize', s.badge)}>{alert.severity}</span>
                    <span className="text-[10px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded border border-slate-600">{alert.type}</span>
                    <span className="text-[10px] text-slate-500">{alert.roomName}</span>
                  </div>
                  <p className="text-sm text-slate-200">{alert.message}</p>
                  <p className="text-xs text-slate-500">{format(new Date(alert.timestamp), 'PPp')}</p>
                </div>
                {!alert.acknowledged && canAccess('Farm Manager') && (
                  <button onClick={() => acknowledgeAlert(alert.id)} className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-farm-400 transition-colors mt-0.5">
                    <CheckCheck size={15} />
                    <span className="hidden sm:inline">Acknowledge</span>
                  </button>
                )}
                {alert.acknowledged && (
                  <span className="text-xs text-slate-600 flex items-center gap-1 shrink-0 mt-0.5"><CheckCheck size={13} />Done</span>
                )}
              </div>
            )
          })}
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-600">
              <Bell size={40} className="mx-auto mb-3 opacity-50" />
              <p>No alerts match your filters</p>
            </div>
          )}
          {visible < filtered.length && (
            <button
              onClick={() => setVisible(v => v + 20)}
              className="w-full py-2.5 text-sm text-slate-400 hover:text-slate-200 bg-slate-800/50 hover:bg-slate-800 border border-slate-700 rounded-xl transition-colors"
            >
              Show more ({filtered.length - visible} remaining)
            </button>
          )}
        </div>
      </div>
    </Layout>
  )
}
