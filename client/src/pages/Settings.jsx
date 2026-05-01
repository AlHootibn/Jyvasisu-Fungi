import { useState } from 'react'
import Layout from '../components/Layout/Layout'
import Toggle from '../components/UI/Toggle'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { useToast } from '../contexts/ToastContext'
import { SENSOR_THRESHOLDS } from '../data/mockData'
import { Settings as SettingsIcon, Bell, Sliders, Moon, Save } from 'lucide-react'

const NOTIF_SETTINGS = [
  { key: 'email', label: 'Email Notifications', desc: 'Receive alerts via email' },
  { key: 'sms', label: 'SMS Alerts', desc: 'Critical alerts via SMS' },
  { key: 'push', label: 'Push Notifications', desc: 'Browser push notifications' },
  { key: 'critical', label: 'Critical Alerts Only', desc: 'Only notify on critical severity' },
]

export default function Settings() {
  const { user, updateCurrentUser } = useAuth()
  const { isDark, toggle } = useTheme()
  const { showToast } = useToast()
  const [notifs, setNotifs] = useState({ email: true, sms: true, push: false, critical: false })
  const [thresholds, setThresholds] = useState(
    Object.fromEntries(Object.entries(SENSOR_THRESHOLDS).map(([k, v]) => [k, { min: v.optimal.min, max: v.optimal.max }]))
  )

  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    if (password && password !== confirmPassword) {
      showToast('Passwords do not match', 'warning')
      return
    }
    if (password && password.length < 6) {
      showToast('Password must be at least 6 characters', 'warning')
      return
    }
    setSaving(true)
    const updates = { name: form.name, email: form.email }
    if (password) updates.password = password
    const result = await updateCurrentUser(updates)
    setSaving(false)
    if (result.success) {
      showToast('Profile saved successfully', 'success')
      setPassword('')
      setConfirmPassword('')
    } else {
      showToast(result.error || 'Failed to save settings')
    }
  }

  return (
    <Layout title="Settings">
      <div className="space-y-5 max-w-screen-md">
        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><SettingsIcon size={16} />Profile</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-farm-900 border border-farm-800 flex items-center justify-center text-xl font-bold text-farm-400">
              {user?.avatar}
            </div>
            <div>
              <p className="font-semibold text-slate-100">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="text-[11px] px-2 py-0.5 bg-farm-900 text-farm-400 border border-farm-800 rounded-full">{user?.role}</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Full Name</label>
              <input className="input" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="label">New Password</label>
              <input type="password" className="input" placeholder="Leave blank to keep current" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div>
              <label className="label">Confirm Password</label>
              <input type="password" className="input" placeholder="Confirm new password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
            </div>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Moon size={16} />Appearance</h2>
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900">
            <div>
              <p className="text-sm text-slate-200">Dark Mode</p>
              <p className="text-xs text-slate-500">Use dark theme across the application</p>
            </div>
            <Toggle enabled={isDark} onChange={toggle} />
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Bell size={16} />Notifications</h2>
          <div className="space-y-3">
            {NOTIF_SETTINGS.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-slate-900">
                <div>
                  <p className="text-sm text-slate-200">{label}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
                <Toggle enabled={notifs[key]} onChange={v => setNotifs(p => ({ ...p, [key]: v }))} />
              </div>
            ))}
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-slate-300 flex items-center gap-2"><Sliders size={16} />Alert Thresholds</h2>
          <p className="text-xs text-slate-500">Define the optimal ranges for automated alerts. Values outside these ranges will trigger notifications.</p>
          <div className="space-y-3">
            {Object.entries(SENSOR_THRESHOLDS).map(([key, meta]) => (
              <div key={key} className="grid grid-cols-3 gap-3 items-center p-3 rounded-lg bg-slate-900">
                <div>
                  <p className="text-sm text-slate-200">{meta.label}</p>
                  <p className="text-xs text-slate-500">unit: {meta.unit}</p>
                </div>
                <div>
                  <label className="label text-[10px]">Min optimal</label>
                  <input
                    type="number"
                    className="input text-sm"
                    value={thresholds[key]?.min ?? meta.optimal.min}
                    onChange={e => setThresholds(p => ({ ...p, [key]: { ...p[key], min: Number(e.target.value) } }))}
                  />
                </div>
                <div>
                  <label className="label text-[10px]">Max optimal</label>
                  <input
                    type="number"
                    className="input text-sm"
                    value={thresholds[key]?.max ?? meta.optimal.max}
                    onChange={e => setThresholds(p => ({ ...p, [key]: { ...p[key], max: Number(e.target.value) } }))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2">
            {saving
              ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Save size={16} />}
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
