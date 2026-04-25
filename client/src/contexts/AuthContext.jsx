import { createContext, useContext, useState, useEffect } from 'react'
import { DEMO_USERS } from '../data/mockData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem('farmiq_user')
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  function login(email, password) {
    const found = DEMO_USERS.find(u => u.email === email && u.password === password)
    if (!found) return { success: false, error: 'Invalid email or password' }
    const { password: _, ...safe } = found
    setUser(safe)
    localStorage.setItem('farmiq_user', JSON.stringify(safe))
    return { success: true }
  }

  function logout() {
    setUser(null)
    localStorage.removeItem('farmiq_user')
  }

  const canAccess = (minRole) => {
    const hierarchy = ['Viewer', 'Worker', 'Farm Manager', 'Farm Owner', 'Super Admin']
    const userLevel = hierarchy.indexOf(user?.role)
    const requiredLevel = hierarchy.indexOf(minRole)
    return userLevel >= requiredLevel
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
