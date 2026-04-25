import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { Users as UsersIcon, Shield, Pencil, Trash2, X, Check, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const ROLES = ['Super Admin', 'Farm Owner', 'Farm Manager', 'Worker', 'Viewer']

const ROLE_STYLES = {
  'Super Admin': 'bg-purple-900/50 text-purple-400 border-purple-800',
  'Farm Owner':  'bg-blue-900/50 text-blue-400 border-blue-800',
  'Farm Manager':'bg-farm-900/50 text-farm-400 border-farm-800',
  'Worker':      'bg-amber-900/50 text-amber-400 border-amber-800',
  'Viewer':      'bg-slate-700 text-slate-400 border-slate-600',
}

const ROLE_PERMS = {
  'Super Admin': ['Full system control', 'Manage all farms', 'Manage users', 'View all analytics'],
  'Farm Owner':  ['Manage their farm', 'Add/remove devices', 'Configure automation', 'View reports'],
  'Farm Manager':['Monitor operations', 'Control devices', 'View alerts', 'Update logs'],
  'Worker':      ['View assigned tasks', 'Input harvest data', 'View sensor readings'],
  'Viewer':      ['Read-only dashboard', 'View reports'],
}

export default function Users() {
  const { users, updateUser, deleteUser } = useFarm()
  const { user: currentUser, canAccess } = useAuth()

  const [editId, setEditId]             = useState(null)
  const [editForm, setEditForm]         = useState({})
  const [editConfirm, setEditConfirm]   = useState(false)

  const [deleteId, setDeleteId]         = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  if (!canAccess('Farm Owner')) {
    return (
      <Layout title="User Management">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Shield size={48} className="text-slate-600 mb-4" />
          <p className="text-slate-400">You don't have permission to manage users.</p>
        </div>
      </Layout>
    )
  }

  const isSuperAdmin = (u) => u.role === 'Super Admin'

  const startEdit = (u) => {
    setEditId(u.id)
    setEditForm({ name: u.name, email: u.email, role: u.role, avatar: u.avatar })
    setEditConfirm(false)
    setDeleteId(null)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditConfirm(false)
  }

  const confirmEdit = () => {
    updateUser(editId, {
      ...editForm,
      avatar: editForm.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
    })
    setEditId(null)
    setEditConfirm(false)
  }

  const startDelete = (u) => {
    setDeleteId(u.id)
    setDeleteConfirm(false)
    setEditId(null)
  }

  const confirmDelete = () => {
    deleteUser(deleteId)
    setDeleteId(null)
    setDeleteConfirm(false)
  }

  const targetUser    = users.find(u => u.id === deleteId)
  const editingUser   = users.find(u => u.id === editId)

  return (
    <Layout title="User Management">
      <div className="space-y-5 max-w-screen-xl">

        {/* Role counts */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {Object.keys(ROLE_STYLES).map(role => (
            <div key={role} className="card text-center">
              <p className="text-xl font-bold text-slate-100">{users.filter(u => u.role === role).length}</p>
              <span className={clsx('text-[10px] px-2 py-0.5 rounded border inline-block mt-1', ROLE_STYLES[role])}>{role}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 card">
            <h2 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <UsersIcon size={16} /> All Users
            </h2>

            <div className="space-y-2">
              {users.map(u => (
                <div
                  key={u.id}
                  className={clsx(
                    'rounded-xl border transition-all',
                    u.id === currentUser?.id ? 'border-farm-800 bg-farm-900/20' : 'border-slate-700 bg-slate-800/40',
                    editId === u.id && 'border-blue-700 bg-blue-900/10',
                    deleteId === u.id && 'border-red-800 bg-red-900/10',
                  )}
                >
                  {/* Normal row */}
                  {editId !== u.id && (
                    <div className="flex items-center gap-3 p-3 group">
                      <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center text-sm font-bold text-slate-300 shrink-0">
                        {u.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200">{u.name}</span>
                          {u.id === currentUser?.id && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-farm-900 text-farm-400 border border-farm-800 rounded">You</span>
                          )}
                          {isSuperAdmin(u) && (
                            <span className="text-[10px] px-1.5 py-0.5 bg-purple-900/50 text-purple-400 border border-purple-800 rounded flex items-center gap-1">
                              <Shield size={9} /> Protected
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                      <div className="text-right space-y-1 mr-1">
                        <span className={clsx('text-[10px] px-2 py-0.5 rounded border inline-block', ROLE_STYLES[u.role])}>{u.role}</span>
                        <p className="text-[10px] text-slate-600">Last: {format(new Date(u.lastLogin), 'MMM d, HH:mm')}</p>
                      </div>

                      {/* Action buttons — only for non-Super Admin, non-self */}
                      {canAccess('Super Admin') && !isSuperAdmin(u) && u.id !== currentUser?.id && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                          <button
                            onClick={() => startEdit(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 transition-colors"
                            title="Edit user"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => startDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-900/30 transition-colors"
                            title="Delete user"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Edit form */}
                  {editId === u.id && (
                    <div className="p-4 space-y-3">
                      <p className="text-xs font-semibold text-blue-400 flex items-center gap-1.5">
                        <Pencil size={13} /> Editing — {editingUser?.name}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="label">Full Name</label>
                          <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Email</label>
                          <input type="email" className="input" value={editForm.email} onChange={e => setEditForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                        <div>
                          <label className="label">Role</label>
                          <select
                            className="select"
                            value={editForm.role}
                            onChange={e => setEditForm(p => ({ ...p, role: e.target.value }))}
                          >
                            {ROLES.filter(r => r !== 'Super Admin').map(r => (
                              <option key={r} value={r}>{r}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {!editConfirm ? (
                        <div className="flex gap-2 pt-1">
                          <button onClick={() => setEditConfirm(true)} className="btn-primary text-sm flex items-center gap-1.5">
                            <Check size={14} /> Save Changes
                          </button>
                          <button onClick={cancelEdit} className="btn-secondary text-sm flex items-center gap-1.5">
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="bg-blue-900/30 border border-blue-800 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <p className="text-sm text-blue-300 flex-1">
                            Confirm changes to <strong>{editingUser?.name}</strong>?
                          </p>
                          <div className="flex gap-2">
                            <button onClick={confirmEdit} className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1">
                              <Check size={13} /> Yes, save
                            </button>
                            <button onClick={() => setEditConfirm(false)} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                              <X size={13} /> Go back
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Delete confirmation */}
                  {deleteId === u.id && (
                    <div className="p-4 space-y-3">
                      <div className="flex items-start gap-3 bg-red-900/20 border border-red-800 rounded-lg p-3">
                        <AlertTriangle size={18} className="text-red-400 shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm text-red-300 font-medium">Delete user permanently?</p>
                          <p className="text-xs text-red-400/70 mt-0.5">
                            <strong>{targetUser?.name}</strong> ({targetUser?.role}) will be removed and cannot be recovered.
                          </p>
                        </div>
                      </div>
                      {!deleteConfirm ? (
                        <div className="flex gap-2">
                          <button onClick={() => setDeleteConfirm(true)} className="btn-danger text-sm flex items-center gap-1.5">
                            <Trash2 size={14} /> Yes, delete user
                          </button>
                          <button onClick={() => setDeleteId(null)} className="btn-secondary text-sm flex items-center gap-1.5">
                            <X size={14} /> Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="bg-red-900/30 border border-red-700 rounded-lg p-3 flex flex-col sm:flex-row items-start sm:items-center gap-3">
                          <p className="text-sm text-red-300 flex-1">
                            Are you absolutely sure? This cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button onClick={confirmDelete} className="btn-danger text-xs px-3 py-1.5 flex items-center gap-1">
                              <Check size={13} /> Confirm delete
                            </button>
                            <button onClick={() => { setDeleteId(null); setDeleteConfirm(false) }} className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1">
                              <X size={13} /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Role permissions reference */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-300">Role Permissions</h2>
            {Object.entries(ROLE_PERMS).map(([role, perms]) => (
              <div key={role} className="card-sm space-y-1.5">
                <span className={clsx('text-[10px] px-2 py-0.5 rounded border inline-block mb-1', ROLE_STYLES[role])}>{role}</span>
                {role === 'Super Admin' && (
                  <p className="text-[10px] text-purple-400 flex items-center gap-1"><Shield size={9} /> Cannot be edited or deleted</p>
                )}
                <ul className="space-y-0.5">
                  {perms.map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-[11px] text-slate-400">
                      <span className="w-1 h-1 rounded-full bg-farm-600 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  )
}
