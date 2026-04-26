import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { Package, Plus, AlertTriangle, TrendingDown, Pencil, Trash2, X, Check } from 'lucide-react'
import clsx from 'clsx'
import { format } from 'date-fns'

const CATEGORIES = ['All', 'Biological', 'Substrate', 'Chemical', 'Supplies', 'Equipment']
const EMPTY = { name: '', category: 'Supplies', quantity: 0, unit: 'pieces', minQuantity: 5, cost: 0, supplier: '' }

export default function Inventory() {
  const { inventory, addInventoryItem, updateInventory, deleteInventoryItem } = useFarm()
  const { canAccess } = useAuth()
  const [cat, setCat] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY)
  const [editId, setEditId] = useState(null)
  const [restockId, setRestockId] = useState(null)
  const [restockQty, setRestockQty] = useState(0)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  const filtered = cat === 'All' ? inventory : inventory.filter(i => i.category === cat)
  const lowStock = inventory.filter(i => i.quantity <= i.minQuantity).length

  const getStatus = (item) => {
    if (item.quantity === 0) return 'critical'
    if (item.quantity <= item.minQuantity) return 'warning'
    return 'optimal'
  }

  const handleStartEdit = (item) => {
    setEditId(item.id)
    setRestockId(null)
    setDeleteConfirmId(null)
    setShowForm(false)
  }

  const handleSaveEdit = (item) => {
    updateInventory(item.id, item)
    setEditId(null)
  }

  const handleDelete = (id) => {
    deleteInventoryItem(id)
    setDeleteConfirmId(null)
  }

  const handleSaveNew = () => {
    if (!form.name) return
    addInventoryItem(form)
    setForm(EMPTY)
    setShowForm(false)
  }

  return (
    <Layout title="Inventory Management">
      <div className="space-y-5 max-w-screen-xl">
        <div className="grid grid-cols-3 gap-3">
          <div className="card flex items-center gap-3">
            <Package size={20} className="text-blue-400" />
            <div><p className="text-xl font-bold text-slate-100">{inventory.length}</p><p className="text-xs text-slate-500">Total Items</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <AlertTriangle size={20} className="text-amber-400" />
            <div><p className={clsx('text-xl font-bold', lowStock > 0 ? 'text-amber-400' : 'text-farm-400')}>{lowStock}</p><p className="text-xs text-slate-500">Low Stock</p></div>
          </div>
          <div className="card flex items-center gap-3">
            <TrendingDown size={20} className="text-red-400" />
            <div><p className="text-xl font-bold text-red-400">{inventory.filter(i => i.quantity === 0).length}</p><p className="text-xs text-slate-500">Out of Stock</p></div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex gap-1.5 flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)} className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium transition-colors', cat === c ? 'bg-farm-700 text-farm-200' : 'bg-slate-800 text-slate-400 hover:bg-slate-700')}>
                {c}
              </button>
            ))}
          </div>
          {canAccess('Farm Owner') && (
            <button onClick={() => { setShowForm(p => !p); setEditId(null) }} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={15} /> Add Item
            </button>
          )}
        </div>

        {showForm && (
          <div className="card border-farm-800 space-y-3">
            <h3 className="text-sm font-semibold text-farm-400">Add Inventory Item</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2"><label className="label">Item Name</label><input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
              <div><label className="label">Category</label>
                <select className="select" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                  {CATEGORIES.slice(1).map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div><label className="label">Quantity</label><input type="number" className="input" value={form.quantity} onChange={e => setForm(p => ({ ...p, quantity: Number(e.target.value) }))} /></div>
              <div><label className="label">Unit</label><input className="input" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} /></div>
              <div><label className="label">Min Quantity</label><input type="number" className="input" value={form.minQuantity} onChange={e => setForm(p => ({ ...p, minQuantity: Number(e.target.value) }))} /></div>
              <div><label className="label">Cost/Unit ($)</label><input type="number" step="0.01" className="input" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: Number(e.target.value) }))} /></div>
              <div><label className="label">Supplier</label><input className="input" value={form.supplier} onChange={e => setForm(p => ({ ...p, supplier: e.target.value }))} /></div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveNew} className="btn-primary text-sm">Save</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {['Item', 'Category', 'Stock', 'Min', 'Cost/Unit', 'Supplier', 'Last Restocked', 'Status', ''].map(h => (
                  <th key={h} className="text-left text-xs text-slate-500 font-medium pb-2 pr-4 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(item => {
                const status = getStatus(item)
                const isEditing = editId === item.id

                if (isEditing) {
                  return <EditRow key={item.id} item={item} onSave={handleSaveEdit} onCancel={() => setEditId(null)} />
                }

                return (
                  <tr key={item.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3 pr-4 font-medium text-slate-200">{item.name}</td>
                    <td className="py-3 pr-4"><span className="badge-neutral text-[10px] px-2 py-0.5 rounded border">{item.category}</span></td>
                    <td className="py-3 pr-4">
                      <span className={clsx('font-bold', status === 'critical' ? 'text-red-400' : status === 'warning' ? 'text-amber-400' : 'text-farm-400')}>
                        {item.quantity} {item.unit}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{item.minQuantity} {item.unit}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">${item.cost}</td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">{item.supplier}</td>
                    <td className="py-3 pr-4 text-slate-500 text-xs">{item.lastRestocked ? format(new Date(item.lastRestocked), 'MMM d, yyyy') : '—'}</td>
                    <td className="py-3 pr-4">
                      <span className={clsx('text-[10px] px-2 py-0.5 rounded border', status === 'critical' ? 'badge-critical' : status === 'warning' ? 'badge-warning' : 'badge-optimal')}>
                        {status === 'critical' ? 'Critical' : status === 'warning' ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {canAccess('Farm Manager') && (
                          restockId === item.id ? (
                            <div className="flex items-center gap-1">
                              <input type="number" className="input w-16 text-xs py-1 px-2" value={restockQty} onChange={e => setRestockQty(Number(e.target.value))} />
                              <button onClick={() => { updateInventory(item.id, { quantity: item.quantity + restockQty }); setRestockId(null); setRestockQty(0) }} className="btn-primary text-xs py-1 px-2">OK</button>
                              <button onClick={() => setRestockId(null)} className="btn-ghost text-xs py-1 px-2">✕</button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={() => { setRestockId(item.id); setRestockQty(0) }} className="text-xs text-farm-400 hover:text-farm-300 whitespace-nowrap">+Stock</button>
                              <button onClick={() => handleStartEdit(item)} className="text-slate-400 hover:text-blue-400 transition-colors" title="Edit">
                                <Pencil size={14} />
                              </button>
                              {deleteConfirmId === item.id ? (
                                <div className="flex items-center gap-1">
                                  <span className="text-xs text-red-400">Sure?</span>
                                  <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-300" title="Confirm delete"><Check size={14} /></button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="text-slate-400 hover:text-slate-200" title="Cancel"><X size={14} /></button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirmId(item.id)} className="text-slate-400 hover:text-red-400 transition-colors" title="Delete">
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </Layout>
  )
}

function EditRow({ item, onSave, onCancel }) {
  const [form, setForm] = useState({ ...item })
  const f = (field) => e => setForm(p => ({ ...p, [field]: field === 'quantity' || field === 'minQuantity' || field === 'cost' ? Number(e.target.value) : e.target.value }))

  return (
    <tr className="bg-slate-800/60 border-l-2 border-farm-600">
      <td className="py-2 pr-2"><input className="input text-xs py-1.5" value={form.name} onChange={f('name')} /></td>
      <td className="py-2 pr-2">
        <select className="select text-xs py-1.5" value={form.category} onChange={f('category')}>
          {['Biological', 'Substrate', 'Chemical', 'Supplies', 'Equipment'].map(c => <option key={c}>{c}</option>)}
        </select>
      </td>
      <td className="py-2 pr-2"><input type="number" className="input text-xs py-1.5 w-20" value={form.quantity} onChange={f('quantity')} /></td>
      <td className="py-2 pr-2"><input type="number" className="input text-xs py-1.5 w-20" value={form.minQuantity} onChange={f('minQuantity')} /></td>
      <td className="py-2 pr-2"><input type="number" step="0.01" className="input text-xs py-1.5 w-20" value={form.cost} onChange={f('cost')} /></td>
      <td className="py-2 pr-2"><input className="input text-xs py-1.5" value={form.supplier} onChange={f('supplier')} /></td>
      <td className="py-2 pr-2 text-slate-500 text-xs">{item.lastRestocked ? format(new Date(item.lastRestocked), 'MMM d, yyyy') : '—'}</td>
      <td className="py-2 pr-2">
        <span className="text-[10px] px-2 py-0.5 rounded border badge-info">editing</span>
      </td>
      <td className="py-2">
        <div className="flex items-center gap-2">
          <button onClick={() => onSave(form)} className="flex items-center gap-1 text-xs text-farm-400 hover:text-farm-300 font-medium">
            <Check size={14} /> Save
          </button>
          <button onClick={onCancel} className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200">
            <X size={14} /> Cancel
          </button>
        </div>
      </td>
    </tr>
  )
}
