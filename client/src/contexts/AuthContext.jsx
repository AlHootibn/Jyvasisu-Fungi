import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('farmiq_user')
    if (saved) {
      try { setUser(JSON.parse(saved)) } catch {}
    }
    setLoading(false)
  }, [])

  async function login(email, password) {
    try {
      const result = await api.login(email, password)
      const userData = { ...result.user, token: result.token }
      setUser(userData)
      localStorage.setItem('farmiq_user', JSON.stringify(userData))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message || 'Invalid email or password' }
    }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('farmiq_user')
  }

  async function updateCurrentUser(updates) {
    try {
      const result = await api.updateUser(user.id, updates)
      const updated = { ...user, name: result.name, email: result.email, avatar: result.avatar }
      setUser(updated)
      localStorage.setItem('farmiq_user', JSON.stringify(updated))
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }

  const canAccess = (minRole) => {
    const hierarchy = ['Viewer', 'Worker', 'Farm Manager', 'Farm Owner', 'Super Admin']
    const userLevel = hierarchy.indexOf(user?.role)
    const requiredLevel = hierarchy.indexOf(minRole)
    return userLevel >= requiredLevel
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canAccess, updateCurrentUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
