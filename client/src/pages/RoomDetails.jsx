import { useParams, useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import SensorCard from '../components/Dashboard/SensorCard'
import DeviceCard from '../components/Dashboard/DeviceCard'
import SensorLineChart from '../components/Charts/SensorLineChart'
import { useFarm } from '../contexts/FarmContext'
import { ArrowLeft } from 'lucide-react'

export default function RoomDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { rooms, sensors, devices, toggleDevice } = useFarm()
  const room = rooms.find(r => r.id === Number(id))
  const s = sensors[Number(id)]
  const roomDevices = devices.filter(d => d.roomId === Number(id))

  if (!room || !s) return (
    <Layout title="Room Details">
      <div className="text-center text-slate-500 py-20">Room not found</div>
    </Layout>
  )

  return (
    <Layout title={`${room.name} — ${room.type}`}>
      <div className="space-y-5 max-w-screen-xl">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/farm')} className="btn-ghost p-2"><ArrowLeft size={18} /></button>
          <div>
            <h2 className="text-lg font-bold text-slate-100">{room.name}</h2>
            <p className="text-sm text-slate-500">{room.type} • {room.species} • {room.currentBatch}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.entries(s).map(([type, value]) => (
            <SensorCard key={type} type={type} value={value} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[['temp', s.temp], ['humidity', s.humidity], ['co2', s.co2], ['moisture', s.moisture]].map(([type, val]) => (
            <div key={type} className="card">
              <h3 className="text-sm font-semibold text-slate-300 mb-2 capitalize">{type} — 24h Trend</h3>
              <SensorLineChart type={type} currentValue={val} height={160} />
            </div>
          ))}
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Devices in {room.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {roomDevices.map(device => (
              <DeviceCard key={device.id} device={device} onToggle={toggleDevice} />
            ))}
          </div>
        </div>

        <div className="card">
          <h3 className="text-sm font-semibold text-slate-300 mb-3">Batch Information</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            {[
              ['Current Batch', room.currentBatch],
              ['Started', room.batchStartDate],
              ['Expected Harvest', room.expectedHarvest],
              ['Capacity', room.capacity],
            ].map(([k, v]) => (
              <div key={k} className="card-sm">
                <p className="text-xs text-slate-500 mb-1">{k}</p>
                <p className="font-semibold text-slate-200">{v}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
