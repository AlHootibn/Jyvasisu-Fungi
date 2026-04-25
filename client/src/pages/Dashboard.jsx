import Layout from '../components/Layout/Layout'
import SensorCard from '../components/Dashboard/SensorCard'
import DeviceCard from '../components/Dashboard/DeviceCard'
import SensorLineChart from '../components/Charts/SensorLineChart'
import { useFarm } from '../contexts/FarmContext'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, CheckCircle, Activity, Layers, TrendingUp, Clock } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const STATUS_COLORS = { optimal: 'bg-farm-500', warning: 'bg-amber-500', critical: 'bg-red-500' }

export default function Dashboard() {
  const { rooms, sensors, devices, alerts, tasks, toggleDevice, harvestLogs } = useFarm()
  const navigate = useNavigate()

  const activeAlerts = alerts.filter(a => !a.acknowledged)
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const todayHarvest = harvestLogs.filter(h => h.date === format(new Date(), 'yyyy-MM-dd')).reduce((s, h) => s + h.weight, 0)
  const activeDevices = devices.filter(d => d.status === 'on').length

  const quickStats = [
    { label: 'Active Rooms', value: rooms.length, icon: Layers, color: 'text-blue-400', bg: 'bg-blue-900/30' },
    { label: 'Active Devices', value: `${activeDevices}/${devices.length}`, icon: Activity, color: 'text-farm-400', bg: 'bg-farm-900/30' },
    { label: "Today's Harvest", value: `${todayHarvest.toFixed(1)} kg`, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-900/30' },
    { label: 'Pending Tasks', value: pendingTasks, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-900/30' },
  ]

  const mainRoom = sensors[1]

  return (
    <Layout title="Dashboard">
      <div className="space-y-5 max-w-screen-2xl">
        {activeAlerts.filter(a => a.severity === 'critical').length > 0 && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-3 flex items-center gap-3">
            <AlertTriangle size={18} className="text-red-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-red-300">
                {activeAlerts.filter(a => a.severity === 'critical').length} critical alert{activeAlerts.filter(a => a.severity === 'critical').length > 1 ? 's' : ''} require attention
              </p>
              <p className="text-xs text-red-400/70 truncate">{activeAlerts.find(a => a.severity === 'critical')?.message}</p>
            </div>
            <button onClick={() => navigate('/alerts')} className="btn-danger text-xs px-3 py-1.5 shrink-0">View alerts</button>
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickStats.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={clsx('p-2.5 rounded-xl', bg)}>
                <Icon size={20} className={color} />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-100">{value}</p>
                <p className="text-xs text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {rooms.map(room => {
            const s = sensors[room.id]
            if (!s) return null
            return (
              <button
                key={room.id}
                onClick={() => navigate(`/farm/${room.id}`)}
                className="card text-left hover:border-farm-700 hover:bg-slate-750 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-200 group-hover:text-farm-400 transition-colors">{room.name}</h3>
                    <p className="text-xs text-slate-500">{room.type}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className={clsx('w-2 h-2 rounded-full animate-pulse', STATUS_COLORS[room.status])} />
                    <span className={clsx('text-xs capitalize font-medium', room.status === 'optimal' ? 'text-farm-400' : room.status === 'warning' ? 'text-amber-400' : 'text-red-400')}>
                      {room.status}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <SensorCard type="temp" value={s.temp} compact />
                  <SensorCard type="humidity" value={s.humidity} compact />
                  <SensorCard type="co2" value={s.co2} compact />
                  <SensorCard type="moisture" value={s.moisture} compact />
                </div>
                <p className="text-[11px] text-slate-600 mt-2 flex items-center gap-1">
                  <span>Batch: {room.currentBatch}</span>
                  <span>•</span>
                  <span>Harvest: {room.expectedHarvest}</span>
                </p>
              </button>
            )
          })}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
          <div className="xl:col-span-3 space-y-4">
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-300 mb-1">Room A1 — Temperature (24h)</h2>
              <SensorLineChart type="temp" currentValue={mainRoom?.temp ?? 21} height={180} />
            </div>
            <div className="card">
              <h2 className="text-sm font-semibold text-slate-300 mb-1">Room A1 — Humidity (24h)</h2>
              <SensorLineChart type="humidity" currentValue={mainRoom?.humidity ?? 89} height={180} />
            </div>
          </div>

          <div className="xl:col-span-2 space-y-3">
            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-300">Device Control</h2>
                <button onClick={() => navigate('/devices')} className="text-xs text-farm-400 hover:text-farm-300">Manage all</button>
              </div>
              <div className="space-y-2">
                {devices.filter(d => d.roomId === 1).map(device => (
                  <DeviceCard key={device.id} device={device} onToggle={toggleDevice} />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-slate-300">Recent Alerts</h2>
                <button onClick={() => navigate('/alerts')} className="text-xs text-farm-400 hover:text-farm-300">View all</button>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 5).map(alert => (
                  <div key={alert.id} className={clsx('flex gap-2 p-2 rounded-lg', alert.acknowledged ? 'opacity-50' : '')}>
                    <div className={clsx('w-2 h-2 rounded-full mt-1.5 shrink-0', alert.severity === 'critical' ? 'bg-red-400' : alert.severity === 'warning' ? 'bg-amber-400' : 'bg-blue-400')} />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-300 leading-snug truncate">{alert.message}</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">{alert.roomName}</p>
                    </div>
                    {!alert.acknowledged && <CheckCircle size={14} className="text-slate-600 hover:text-farm-400 cursor-pointer shrink-0 mt-0.5" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
