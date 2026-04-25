import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Leaf } from 'lucide-react'

const DEMO_CREDS = [
  { label: 'Super Admin', email: 'admin@farm.com', password: 'admin123' },
  { label: 'Farm Manager', email: 'manager@farm.com', password: 'manager123' },
  { label: 'Worker', email: 'worker@farm.com', password: 'worker123' },
]

export default function Login() {
  const [email, setEmail] = useState('admin@farm.com')
  const [password, setPassword] = useState('admin123')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = login(email, password)
    setLoading(false)
    if (result.success) navigate('/')
    else setError(result.error)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-farm-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-farm-900/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-farm-900 rounded-2xl border border-farm-800 mb-4">
            <span className="text-3xl">🍄</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">JyväSisu Fungi</h1>
          <p className="text-sm text-slate-400 mt-1">IoT Mushroom Farm Management System</p>
        </div>

        <div className="card border-slate-700 shadow-2xl">
          <h2 className="text-lg font-semibold text-slate-100 mb-6">Sign in to your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@farm.com" required />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="input pr-10"
                  placeholder="••••••••"
                  required
                />
                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-3 py-2 rounded-lg">{error}</div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
              {loading ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><Leaf size={16} /> Sign in</>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-700">
            <p className="text-xs text-slate-500 mb-3 font-medium uppercase tracking-wide">Quick demo access</p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_CREDS.map(c => (
                <button
                  key={c.email}
                  type="button"
                  onClick={() => { setEmail(c.email); setPassword(c.password) }}
                  className="text-[11px] text-center p-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-slate-100 transition-colors border border-slate-600"
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          JyväSisu Fungi • Jyväskylä, Finland
        </p>
      </div>
    </div>
  )
}
