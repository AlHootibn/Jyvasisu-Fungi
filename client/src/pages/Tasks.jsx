import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { CheckSquare, Plus, Trash2, Clock, AlertCircle } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const PRIORITY_STYLES = { critical: 'badge-critical', high: 'badge-warning', medium: 'badge-info', low: 'badge-neutral' }
const STATUS_STYLES = { pending: 'badge-neutral', 'in-progress': 'badge-info', completed: 'badge-optimal' }
const STATUS_LABELS = { pending: 'Pending', 'in-progress': 'In Progress', completed: 'Completed' }

const EMPTY = { title: '', description: '', assignedTo: 4, priority: 'medium', status: 'pending', dueDate: format(new Date(), 'yyyy-MM-dd'), roomId: null }

export default function Tasks() {
  const { tasks, users, rooms, addTask, updateTask, deleteTask } = useFarm()
  const { canAccess } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter)
  const pending = tasks.filter(t => t.status === 'pending').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const completed = tasks.filter(t => t.status === 'completed').length

  return (
    <Layout title="Task Management">
      <div className="space-y-5 max-w-screen-lg">
        <div className="grid grid-cols-3 gap-3">
          {[['Pending', pending, 'text-amber-400'], ['In Progress', inProgress, 'text-blue-400'], ['Completed', completed, 'text-farm-400']].map(([l, v, c]) => (
            <div key={l} className="card text-center">
              <p className={clsx('text-2xl font-bold', c)}>{v}</p>
              <p className="text-xs text-slate-500">{l}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-2">
            {['all', 'pending', 'in-progress', 'completed'].map(f => (
              <button key={f} onClick={() => setFilter(f)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors', filter === f ? 'bg-farm-700 text-farm-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
                {f === 'all' ? 'All' : STATUS_LABELS[f]}
              </button>
            ))}
          </div>
          {canAccess('Farm Manager') && (
            <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Add Task
            </button>
          )}
        </div>

        {showForm && (
          <div className="card border-farm-800 space-y-3">
            <h3 className="text-sm font-semibold text-farm-400">New Task</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="label">Title</label>
                <input className="input" placeholder="Task title" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Description</label>
                <textarea className="input" rows={2} placeholder="Optional details" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
              <div>
                <label className="label">Assign To</label>
                <select className="select" value={form.assignedTo} onChange={e => setForm(p => ({ ...p, assignedTo: Number(e.target.value) }))}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
                </select>
              </div>
              <div>
                <label className="label">Priority</label>
                <select className="select" value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                  {['critical', 'high', 'medium', 'low'].map(p => <option key={p} value={p} className="capitalize">{p}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" className="input" value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
              </div>
              <div>
                <label className="label">Room (optional)</label>
                <select className="select" value={form.roomId ?? ''} onChange={e => setForm(p => ({ ...p, roomId: e.target.value ? Number(e.target.value) : null }))}>
                  <option value="">All / No specific room</option>
                  {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { if (form.title) { addTask(form); setForm(EMPTY); setShowForm(false) } }} className="btn-primary text-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-2">
          {filtered.map(task => {
            const assignee = users.find(u => u.id === task.assignedTo)
            const room = rooms.find(r => r.id === task.roomId)
            const isOverdue = task.status !== 'completed' && task.dueDate < format(new Date(), 'yyyy-MM-dd')
            return (
              <div key={task.id} className={clsx('card flex gap-3 transition-all', task.status === 'completed' && 'opacity-60')}>
                <button
                  onClick={() => canAccess('Worker') && updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' })}
                  className={clsx('w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors', task.status === 'completed' ? 'border-farm-500 bg-farm-500' : 'border-slate-600 hover:border-farm-500')}
                >
                  {task.status === 'completed' && <CheckSquare size={12} className="text-white" />}
                </button>
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={clsx('text-sm font-medium', task.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-200')}>{task.title}</span>
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border capitalize', PRIORITY_STYLES[task.priority])}>{task.priority}</span>
                    <span className={clsx('text-[10px] px-1.5 py-0.5 rounded border', STATUS_STYLES[task.status])}>{STATUS_LABELS[task.status]}</span>
                    {isOverdue && <span className="text-[10px] px-1.5 py-0.5 rounded border badge-critical flex items-center gap-0.5"><AlertCircle size={9} />Overdue</span>}
                  </div>
                  {task.description && <p className="text-xs text-slate-500">{task.description}</p>}
                  <div className="flex flex-wrap gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1"><Clock size={11} />{task.dueDate}</span>
                    {assignee && <span>Assigned: <span className="text-slate-400">{assignee.name}</span></span>}
                    {room && <span>Room: <span className="text-slate-400">{room.name}</span></span>}
                  </div>
                </div>
                <div className="flex items-start gap-1">
                  {task.status === 'pending' && canAccess('Farm Manager') && (
                    <button onClick={() => updateTask(task.id, { status: 'in-progress' })} className="text-[10px] px-2 py-1 bg-blue-900/40 text-blue-400 border border-blue-800 rounded hover:bg-blue-900/60 transition-colors">Start</button>
                  )}
                  {canAccess('Farm Manager') && (
                    <button onClick={() => deleteTask(task.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
          {filtered.length === 0 && <p className="text-center text-slate-600 py-8">No tasks found</p>}
        </div>
      </div>
    </Layout>
  )
}
