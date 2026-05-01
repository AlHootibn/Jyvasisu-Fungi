import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Leaf, Plus, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { format, subDays } from 'date-fns'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs shadow-xl">
      <p className="text-slate-400 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }} className="font-medium">{p.name}: {p.value} kg</p>)}
    </div>
  )
}

export default function Production() {
  const { harvestLogs, addHarvestLog, deleteHarvestLog, rooms } = useFarm()
  const { canAccess } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ roomId: 1, date: format(new Date(), 'yyyy-MM-dd'), weight: '', quality: 'A', species: 'Oyster', notes: '' })
  const [deleteId, setDeleteId] = useState(null)

  const totalWeight = harvestLogs.reduce((s, h) => s + h.weight, 0)
  const gradeA = harvestLogs.filter(h => h.quality === 'A').length
  const gradeAPct = Math.round((gradeA / harvestLogs.length) * 100)

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const date = format(subDays(new Date(), 13 - i), 'yyyy-MM-dd')
    const day = format(subDays(new Date(), 13 - i), 'MM/dd')
    const logs = harvestLogs.filter(h => h.date === date)
    return {
      day,
      'Oyster': logs.filter(h => h.species === 'Oyster').reduce((s, h) => s + h.weight, 0).toFixed(1),
      'Shiitake': logs.filter(h => h.species === 'Shiitake').reduce((s, h) => s + h.weight, 0).toFixed(1),
      'Button': logs.filter(h => h.species === 'Button').reduce((s, h) => s + h.weight, 0).toFixed(1),
    }
  })

  const handleAdd = () => {
    if (!form.weight) return
    const room = rooms.find(r => r.id === Number(form.roomId))
    addHarvestLog({ ...form, roomId: Number(form.roomId), roomName: room?.name, weight: parseFloat(form.weight) })
    setShowForm(false)
    setForm({ roomId: 1, date: format(new Date(), 'yyyy-MM-dd'), weight: '', quality: 'A', species: 'Oyster', notes: '' })
  }

  return (
    <Layout title="Production Tracking">
      <div className="space-y-5 max-w-screen-xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Yield (30d)', value: `${totalWeight.toFixed(1)} kg`, color: 'text-farm-400' },
            { label: 'Grade A Quality', value: `${gradeAPct}%`, color: 'text-blue-400' },
            { label: 'Avg Daily', value: `${(totalWeight / 30).toFixed(1)} kg`, color: 'text-purple-400' },
            { label: 'Harvest Entries', value: harvestLogs.length, color: 'text-amber-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="card text-center">
              <p className={clsx('text-2xl font-bold', color)}>{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Harvest by Species (Last 14 Days)</h2>
          {canAccess('Farm Manager') && (
            <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Log Harvest
            </button>
          )}
        </div>

        {showForm && (
          <div className="card border-farm-800 space-y-3">
            <h3 className="text-sm font-semibold text-farm-400 flex items-center gap-2"><Leaf size={15} />New Harvest Entry</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div><label className="label">Room</label>
                <select className="select" value={form.roomId} onChange={e => setForm(p => ({ ...p, roomId: e.target.value }))}>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div><label className="label">Date</label><input type="date" className="input" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} /></div>
              <div><label className="label">Weight (kg)</label><input type="number" step="0.1" className="input" placeholder="e.g. 3.5" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} /></div>
              <div><label className="label">Species</label>
                <select className="select" value={form.species} onChange={e => setForm(p => ({ ...p, species: e.target.value }))}>
                  {['Oyster', 'Shiitake', 'Button'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div><label className="label">Quality Grade</label>
                <select className="select" value={form.quality} onChange={e => setForm(p => ({ ...p, quality: e.target.value }))}>
                  <option value="A">Grade A (Premium)</option>
                  <option value="B">Grade B (Standard)</option>
                  <option value="C">Grade C (Processing)</option>
                </select>
              </div>
              <div><label className="label">Notes</label><input className="input" placeholder="Optional" value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleAdd} className="btn-primary text-sm">Save Entry</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="card">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={last14Days}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickLine={false} unit=" kg" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
              <Bar dataKey="Oyster" stackId="a" fill="#22c55e" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Shiitake" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Button" stackId="a" fill="#a855f7" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h2 className="text-sm font-semibold text-slate-300 mb-3">Harvest Log</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {['Date', 'Room', 'Species', 'Weight', 'Quality', 'Notes'].map(h => (
                    <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[...harvestLogs].reverse().slice(0, 20).map(log => (
                  <tr key={log.id} className="hover:bg-slate-800/50 group">
                    <td className="py-2 pr-4 text-slate-400 text-xs">{log.date}</td>
                    <td className="py-2 pr-4 text-slate-300">{log.roomName}</td>
                    <td className="py-2 pr-4 text-slate-400 text-xs">{log.species}</td>
                    <td className="py-2 pr-4 text-farm-400 font-medium">{log.weight} kg</td>
                    <td className="py-2 pr-4">
                      <span className={clsx('text-xs px-2 py-0.5 rounded border', log.quality === 'A' ? 'badge-optimal' : log.quality === 'B' ? 'badge-warning' : 'badge-critical')}>{log.quality}</span>
                    </td>
                    <td className="py-2 text-slate-500 text-xs">{log.notes || '—'}</td>
                    {canAccess('Farm Manager') && (
                      <td className="py-2 text-right">
                        {deleteId === log.id ? (
                          <div className="flex items-center gap-1 justify-end">
                            <button onClick={() => { deleteHarvestLog(log.id); setDeleteId(null) }} className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 rounded border border-red-800 hover:bg-red-900/30 transition-colors">Confirm</button>
                            <button onClick={() => setDeleteId(null)} className="text-xs text-slate-500 hover:text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-colors">Cancel</button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteId(log.id)} className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg">
                            <Trash2 size={13} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  )
}
