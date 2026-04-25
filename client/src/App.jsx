import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import FarmOverview from './pages/FarmOverview'
import RoomDetails from './pages/RoomDetails'
import Devices from './pages/Devices'
import Automation from './pages/Automation'
import Reports from './pages/Reports'
import Tasks from './pages/Tasks'
import Inventory from './pages/Inventory'
import Production from './pages/Production'
import Users from './pages/Users'
import Alerts from './pages/Alerts'
import Settings from './pages/Settings'

function Protected({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <span className="text-4xl animate-bounce">🍄</span>
        <p className="text-slate-500 text-sm">Loading JyväSisu Fungi...</p>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/farm" element={<Protected><FarmOverview /></Protected>} />
      <Route path="/farm/:id" element={<Protected><RoomDetails /></Protected>} />
      <Route path="/devices" element={<Protected><Devices /></Protected>} />
      <Route path="/automation" element={<Protected><Automation /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="/tasks" element={<Protected><Tasks /></Protected>} />
      <Route path="/inventory" element={<Protected><Inventory /></Protected>} />
      <Route path="/production" element={<Protected><Production /></Protected>} />
      <Route path="/users" element={<Protected><Users /></Protected>} />
      <Route path="/alerts" element={<Protected><Alerts /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
