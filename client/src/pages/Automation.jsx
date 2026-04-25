import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import Toggle from '../components/UI/Toggle'
import { useFarm } from '../contexts/FarmContext'
import { useAuth } from '../contexts/AuthContext'
import { Zap, Plus, Trash2, ArrowRight } from 'lucide-react'
import clsx from 'clsx'

const SENSOR_OPTS = ['temp', 'humidity', 'co2', 'light', 'moisture']
const DEVICE_OPTS = ['humidifier', 'fan', 'heater', 'lights', 'pump']
const OP_OPTS = ['<', '>', '<=', '>=', '=']

const SENSOR_LABELS = { temp: 'Temperature', humidity: 'Humidity', co2: 'CO₂ Level', light: 'Light', moisture: 'Substrate Moisture' }
const SENSOR_UNITS = { temp: '°C', humidity: '%', co2: 'ppm', light: 'lux', moisture: '%' }
const DEVICE_ICONS = { humidifier: '💧', fan: '🌬️', heater: '🔥', lights: '💡', pump: '🚿' }

const EMPTY_RULE = { name: '', isActive: true, condition: { sensor: 'humidity', operator: '<', value: 85 }, action: { device: 'humidifier', state: 'on' }, description: '' }

export default function Automation() {
  const { automationRules, toggleAutomationRule, addAutomationRule, deleteAutomationRule } = useFarm()
  const { canAccess } = useAuth()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_RULE)

  const handleAdd = () => {
    if (!form.name) return
    addAutomationRule(form)
    setForm(EMPTY_RULE)
    setShowForm(false)
  }

  const activeCount = automationRules.filter(r => r.isActive).length

  return (
    <Layout title="Automation Engine">
      <div className="space-y-5 max-w-screen-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="card-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-farm-400 animate-pulse" />
              <span className="text-sm text-slate-300">{activeCount} active rules</span>
            </div>
            <div className="card-sm text-sm text-slate-400">{automationRules.length} total</div>
          </div>
          {canAccess('Farm Owner') && (
            <button onClick={() => setShowForm(p => !p)} className="btn-primary flex items-center gap-2 text-sm">
              <Plus size={16} /> New Rule
            </button>
          )}
        </div>

        {showForm && (
          <div className="card border-farm-800 space-y-4">
            <h3 className="text-sm font-semibold text-farm-400 flex items-center gap-2"><Zap size={16} />New Automation Rule</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Rule Name</label>
                <input className="input" placeholder="e.g. Humidity Auto Control" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div>
                <label className="label">Description</label>
                <input className="input" placeholder="Optional description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="label">IF Sensor</label>
                <select className="select" value={form.condition.sensor} onChange={e => setForm(p => ({ ...p, condition: { ...p.condition, sensor: e.target.value } }))}>
                  {SENSOR_OPTS.map(s => <option key={s} value={s}>{SENSOR_LABELS[s]}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Operator</label>
                <select className="select" value={form.condition.operator} onChange={e => setForm(p => ({ ...p, condition: { ...p.condition, operator: e.target.value } }))}>
                  {OP_OPTS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Value ({SENSOR_UNITS[form.condition.sensor]})</label>
                <input type="number" className="input" value={form.condition.value} onChange={e => setForm(p => ({ ...p, condition: { ...p.condition, value: Number(e.target.value) } }))} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">THEN Device</label>
                <select className="select" value={form.action.device} onChange={e => setForm(p => ({ ...p, action: { ...p.action, device: e.target.value } }))}>
                  {DEVICE_OPTS.map(d => <option key={d} value={d}>{DEVICE_ICONS[d]} {d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">Action</label>
                <select className="select" value={form.action.state} onChange={e => setForm(p => ({ ...p, action: { ...p.action, state: e.target.value } }))}>
                  <option value="on">Turn ON</option>
                  <option value="off">Turn OFF</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAdd} className="btn-primary text-sm">Save Rule</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {automationRules.map(rule => (
            <div key={rule.id} className={clsx('card flex flex-col sm:flex-row gap-3 transition-all', !rule.isActive && 'opacity-50')}>
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-slate-200">{rule.name}</span>
                  <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', rule.isActive ? 'badge-optimal' : 'badge-neutral')}>
                    {rule.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full badge-info">Priority {rule.priority}</span>
                </div>
                <div className="flex items-center flex-wrap gap-2 text-sm">
                  <span className="bg-slate-700 px-2 py-0.5 rounded text-slate-300 text-xs">
                    IF {SENSOR_LABELS[rule.condition.sensor]} {rule.condition.operator} {rule.condition.value}{SENSOR_UNITS[rule.condition.sensor] || ''}
                  </span>
                  <ArrowRight size={14} className="text-slate-500" />
                  <span className={clsx('px-2 py-0.5 rounded text-xs font-medium', rule.action.state === 'on' ? 'bg-farm-900 text-farm-400 border border-farm-800' : 'bg-red-900/40 text-red-400 border border-red-900')}>
                    {DEVICE_ICONS[rule.action.device]} {rule.action.device} → {rule.action.state.toUpperCase()}
                  </span>
                </div>
                {rule.description && <p className="text-xs text-slate-500">{rule.description}</p>}
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end">
                {canAccess('Farm Owner') && (
                  <Toggle enabled={rule.isActive} onChange={() => toggleAutomationRule(rule.id)} />
                )}
                {canAccess('Farm Owner') && (
                  <button onClick={() => deleteAutomationRule(rule.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
