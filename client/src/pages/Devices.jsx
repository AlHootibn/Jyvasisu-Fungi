import Layout from '../components/Layout/Layout'
import DeviceCard from '../components/Dashboard/DeviceCard'
import { useFarm } from '../contexts/FarmContext'
import { Cpu, Activity, ZapOff } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'

export default function Devices() {
  const { rooms, devices, toggleDevice } = useFarm()
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? devices : filter === 'on' ? devices.filter(d => d.status === 'on') : devices.filter(d => d.status === 'off')
  const onCount = devices.filter(d => d.status === 'on').length
  const totalPower = devices.filter(d => d.status === 'on').reduce((s, d) => s + d.power, 0)

  return (
    <Layout title="Device Management">
      <div className="space-y-5 max-w-screen-xl">
        <div className="grid grid-cols-3 gap-3">
          <div className="card flex items-center gap-3">
            <Cpu size={20} className="text-blue-400" />
            <div>
              <p className="text-xl font-bold text-slate-100">{devices.length}</p>
              <p className="text-xs text-slate-500">Total Devices</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <Activity size={20} className="text-farm-400" />
            <div>
              <p className="text-xl font-bold text-farm-400">{onCount}</p>
              <p className="text-xs text-slate-500">Active</p>
            </div>
          </div>
          <div className="card flex items-center gap-3">
            <ZapOff size={20} className="text-amber-400" />
            <div>
              <p className="text-xl font-bold text-amber-400">{totalPower}W</p>
              <p className="text-xs text-slate-500">Power Draw</p>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {['all', 'on', 'off'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className={clsx('px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-colors', filter === f ? 'bg-farm-700 text-farm-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
              {f === 'all' ? 'All' : f === 'on' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>

        {rooms.map(room => {
          const roomDevices = filtered.filter(d => d.roomId === room.id)
          if (!roomDevices.length) return null
          return (
            <div key={room.id} className="space-y-2">
              <h2 className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-farm-500" />
                {room.name} — {room.type}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                {roomDevices.map(device => (
                  <DeviceCard key={device.id} device={device} onToggle={toggleDevice} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </Layout>
  )
}
