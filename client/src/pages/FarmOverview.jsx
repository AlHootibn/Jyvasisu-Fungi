import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout/Layout'
import SensorCard from '../components/Dashboard/SensorCard'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { MapPin, Calendar, Layers, ArrowRight, Plus, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const STATUS_STYLES = { optimal: 'badge-optimal', warning: 'badge-warning', critical: 'badge-critical' }

const SPECIES_OPTIONS = [
  'Pleurotus ostreatus', 'Pleurotus eryngii', 'Lentinula edodes',
  'Agaricus bisporus', 'Grifola frondosa', 'Hericium erinaceus',
  'Flammulina velutipes', 'Cyclocybe aegerita', 'Other',
]

const EMPTY_ROOM = {
  farmId: 1,
  name: '',
  type: '',
  species: 'Pleurotus ostreatus',
  capacity: '',
  currentBatch: '',
  batchStartDate: format(new Date(), 'yyyy-MM-dd'),
  expectedHarvest: '',
}

export default function FarmOverview() {
  const { farms, rooms, sensors, updateRoom, addRoom, deleteRoom } = useFarm()
  const { canAccess } = useAuth()
  const navigate = useNavigate()
  const farm = farms[0]

  const [showAddForm, setShowAddForm]     = useState(false)
  const [addForm, setAddForm]             = useState(EMPTY_ROOM)

  const [editId, setEditId]               = useState(null)
  const [editForm, setEditForm]           = useState({})
  const [editConfirm, setEditConfirm]     = useState(false)

  const [deleteId, setDeleteId]           = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const startEdit = (room) => {
    setEditId(room.id)
    setEditForm({ ...room })
    setEditConfirm(false)
    setDeleteId(null)
    setShowAddForm(false)
  }

  const cancelEdit = () => { setEditId(null); setEditConfirm(false) }

  const confirmEdit = () => {
    updateRoom(editId, editForm)
    setEditId(null)
    setEditConfirm(false)
  }

  const startDelete = (room) => {
    setDeleteId(room.id)
    setDeleteConfirm(false)
    setEditId(null)
    setShowAddForm(false)
  }

  const confirmDelete = () => {
    deleteRoom(deleteId)
    setDeleteId(null)
    setDeleteConfirm(false)
  }

  const handleAddRoom = () => {
    if (!addForm.name || !addForm.type) return
    addRoom(addForm)
    setAddForm(EMPTY_ROOM)
    setShowAddForm(false)
  }

  const ef = (field) => (e) => setEditForm(p => ({ ...p, [field]: e.target.value }))
  const af = (field) => (e) => setAddForm(p => ({ ...p, [field]: e.target.value }))

  return (
    <Layout title="Farm Overview">
      <div className="space-y-5 max-w-screen-xl">

        {/* Farm header */}
        <div className="card flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-farm-900 rounded-xl flex items-center justify-center text-2xl shrink-0">🏭</div>
              <div>
                <h2 className="text-xl font-bold text-slate-100">{farm.name}</h2>
                <div className="flex flex-wrap items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-sm text-slate-400"><MapPin size={13} />{farm.location}</span>
                  <span className="flex items-center gap-1 text-sm text-slate-400"><Calendar size={13} />Est. {farm.established}</span>
                  <span className="flex items-center gap-1 text-sm text-slate-400"><Layers size={13} />{farm.area}</span>
                </div>
                <p className="text-sm text-slate-500 mt-2">{farm.description}</p>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:w-48">
            <div className="card-sm text-center">
              <p className="text-2xl font-bold text-farm-400">{rooms.length}</p>
              <p className="text-[11px] text-slate-500">Grow Rooms</p>
            </div>
            <div className="card-sm text-center">
              <p className={clsx('text-2xl font-bold', farm.activeAlerts > 0 ? 'text-red-400' : 'text-farm-400')}>{farm.activeAlerts}</p>
              <p className="text-[11px] text-slate-500">Active Alerts</p>
            </div>
            <div className="card-sm text-center col-span-2">
              <span className={clsx('px-3 py-1 rounded-full text-xs font-medium border', farm.status === 'active' ? 'badge-optimal' : 'badge-neutral')}>
                {farm.status === 'active' ? '● Active & Operating' : farm.status}
              </span>
            </div>
          </div>
        </div>

        {/* Rooms header */}
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-300">Growing Rooms ({rooms.length})</h2>
          {canAccess('Farm Owner') && (
            <button
              onClick={() => { setShowAddForm(p => !p); setEditId(null); setDeleteId(null) }}
              className="btn-primary flex items-center gap-2 text-sm"
            >
              <Plus size={15} /> Add Room
            </button>
          )}
        </div>

        {/* Add room form */}
        {showAddForm && (
          <div className="card border-farm-800 space-y-4">
            <h3 className="text-sm font-semibold text-farm-400 flex items-center gap-2"><Plus size={15} />New Growing Room</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label className="label">Room Name</label>
                <input className="input" placeholder="e.g. Room D4" value={addForm.name} onChange={af('name')} />
              </div>
              <div>
                <label className="label">Mushroom Type</label>
                <input className="input" placeholder="e.g. Oyster Mushrooms" value={addForm.type} onChange={af('type')} />
              </div>
              <div>
                <label className="label">Species</label>
                <select className="select" value={addForm.species} onChange={af('species')}>
                  {SPECIES_OPTIONS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Capacity</label>
                <input className="input" placeholder="e.g. 200 bags" value={addForm.capacity} onChange={af('capacity')} />
              </div>
              <div>
                <label className="label">Current Batch</label>
                <input className="input" placeholder="e.g. Batch #048" value={addForm.currentBatch} onChange={af('currentBatch')} />
              </div>
              <div>
                <label className="label">Batch Start Date</label>
                <input type="date" className="input" value={addForm.batchStartDate} onChange={af('batchStartDate')} />
              </div>
              <div>
                <label className="label">Expected Harvest</label>
                <input type="date" className="input" value={addForm.expectedHarvest} onChange={af('expectedHarvest')} />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <button onClick={handleAddRoom} className="btn-primary text-sm flex items-center gap-1.5">
                <Check size={14} /> Save Room
              </button>
              <button onClick={() => setShowAddForm(false)} className="btn-secondary text-sm flex items-center gap-1.5">
                <X size={14} /> Cancel
              </button>
            </div>
          </div>
        )}

        {/* Room cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {rooms.map(room => {
            const s = sensors[room.id]
            const isEditing = editId === room.id
            const isDeleting = deleteId === room.id

            return (
              <div key={room.id} className={clsx(
                'card space-y-4 transition-all',
                isEditing && 'border-blue-700 bg-blue-900/5',
                isDeleting && 'border-red-800 bg-red-900/5',
              )}>

                {/* Room header */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0 pr-2">
                    <h3 className="text-lg font-semibold text-slate-100 truncate">{room.name}</h3>
                    <p className="text-sm text-slate-400">{room.type}</p>
                    <p className="text-xs text-slate-500 italic">{room.species}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={clsx('text-xs px-2 py-0.5 rounded-full border font-medium', STATUS_STYLES[room.status])}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                    {canAccess('Farm Owner') && !isEditing && !isDeleting && (
                      <>
                        <button onClick={() => startEdit(room)} className="p-1.5 rounded-lg text-slate-500 hover:text-blue-400 hover:bg-blue-900/30 transition-colors" title="Edit room">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => startDelete(room)} className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-900/30 transition-colors" title="Delete room">
                          <Trash2 size={14} />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit form */}
                {isEditing && (
                  <div className="space-y-3 border-t border-blue-800/50 pt-3">
                    <p className="text-xs font-semibold text-blue-400 flex items-center gap-1.5"><Pencil size={12} />Editing room</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div><label className="label text-[11px]">Room Name</label><input className="input text-sm py-1.5" value={editForm.name} onChange={ef('name')} /></div>
                      <div><label className="label text-[11px]">Mushroom Type</label><input className="input text-sm py-1.5" value={editForm.type} onChange={ef('type')} /></div>
                      <div><label className="label text-[11px]">Species</label>
                        <select className="select text-sm py-1.5" value={editForm.species} onChange={ef('species')}>
                          {SPECIES_OPTIONS.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div><label className="label text-[11px]">Capacity</label><input className="input text-sm py-1.5" value={editForm.capacity} onChange={ef('capacity')} /></div>
                      <div><label className="label text-[11px]">Current Batch</label><input className="input text-sm py-1.5" value={editForm.currentBatch} onChange={ef('currentBatch')} /></div>
                      <div><label className="label text-[11px]">Status</label>
                        <select className="select text-sm py-1.5" value={editForm.status} onChange={ef('status')}>
                          <option value="optimal">Optimal</option>
                          <option value="warning">Warning</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                      <div><label className="label text-[11px]">Batch Start Date</label><input type="date" className="input text-sm py-1.5" value={editForm.batchStartDate} onChange={ef('batchStartDate')} /></div>
                      <div><label className="label text-[11px]">Expected Harvest</label><input type="date" className="input text-sm py-1.5" value={editForm.expectedHarvest} onChange={ef('expectedHarvest')} /></div>
                    </div>

                    {!editConfirm ? (
                      <div className="flex gap-2">
                        <button onClick={() => setEditConfirm(true)} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check size={13} />Save</button>
                        <button onClick={cancelEdit} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><X size={13} />Cancel</button>
                      </div>
                    ) : (
                      <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-blue-300">Confirm changes to <strong>{room.name}</strong>?</p>
                        <div className="flex gap-2">
                          <button onClick={confirmEdit} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"><Check size={13} />Yes, save</button>
                          <button onClick={() => setEditConfirm(false)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><X size={13} />Go back</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Delete confirmation */}
                {isDeleting && (
                  <div className="space-y-3 border-t border-red-800/50 pt-3">
                    <div className="flex items-start gap-2 bg-red-900/20 border border-red-800 rounded-lg p-3">
                      <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-red-300 font-medium">Delete this room?</p>
                        <p className="text-xs text-red-400/70 mt-0.5">All sensor data and devices linked to <strong>{room.name}</strong> will also be removed.</p>
                      </div>
                    </div>
                    {!deleteConfirm ? (
                      <div className="flex gap-2">
                        <button onClick={() => setDeleteConfirm(true)} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"><Trash2 size={13} />Yes, delete</button>
                        <button onClick={() => setDeleteId(null)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><X size={13} />Cancel</button>
                      </div>
                    ) : (
                      <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 space-y-2">
                        <p className="text-xs text-red-300">Are you absolutely sure? This cannot be undone.</p>
                        <div className="flex gap-2">
                          <button onClick={confirmDelete} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1"><Check size={13} />Confirm delete</button>
                          <button onClick={() => { setDeleteId(null); setDeleteConfirm(false) }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"><X size={13} />Cancel</button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Sensor readings */}
                {!isEditing && !isDeleting && s && (
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(s).map(([type, value]) => (
                      <SensorCard key={type} type={type} value={value} compact />
                    ))}
                  </div>
                )}

                {/* Batch info */}
                {!isEditing && !isDeleting && (
                  <>
                    <div className="pt-3 border-t border-slate-700 space-y-1 text-xs text-slate-500">
                      <div className="flex justify-between"><span>Capacity</span><span className="text-slate-300">{room.capacity}</span></div>
                      <div className="flex justify-between"><span>Current batch</span><span className="text-slate-300">{room.currentBatch}</span></div>
                      <div className="flex justify-between"><span>Started</span><span className="text-slate-300">{room.batchStartDate}</span></div>
                      <div className="flex justify-between"><span>Expected harvest</span><span className="text-farm-400 font-medium">{room.expectedHarvest}</span></div>
                    </div>
                    <button
                      onClick={() => navigate(`/farm/${room.id}`)}
                      className="w-full btn-secondary text-sm flex items-center justify-center gap-1"
                    >
                      View Room Details <ArrowRight size={14} />
                    </button>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}
