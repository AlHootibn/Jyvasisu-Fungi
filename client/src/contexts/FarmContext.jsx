import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import {
  INITIAL_SENSORS, INITIAL_DEVICES, INITIAL_ALERTS, INITIAL_TASKS,
  INITIAL_INVENTORY, INITIAL_HARVEST_LOGS, INITIAL_AUTOMATION_RULES,
  INITIAL_ROOMS, INITIAL_FARMS, DEMO_USERS, simulateSensorUpdate
} from '../data/mockData'

const FarmContext = createContext(null)

export function FarmProvider({ children }) {
  const [farms] = useState(INITIAL_FARMS)
  const [rooms, setRooms] = useState(INITIAL_ROOMS)
  const [sensors, setSensors] = useState(INITIAL_SENSORS)
  const [devices, setDevices] = useState(INITIAL_DEVICES)
  const [alerts, setAlerts] = useState(INITIAL_ALERTS)
  const [tasks, setTasks] = useState(INITIAL_TASKS)
  const [inventory, setInventory] = useState(INITIAL_INVENTORY)
  const [harvestLogs, setHarvestLogs] = useState(INITIAL_HARVEST_LOGS)
  const [automationRules, setAutomationRules] = useState(INITIAL_AUTOMATION_RULES)
  const [users, setUsers] = useState(DEMO_USERS.map(({ password: _, ...u }) => u))
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setSensors(prev => simulateSensorUpdate(prev))
      setLastUpdate(new Date())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const toggleDevice = useCallback((deviceId) => {
    setDevices(prev => prev.map(d =>
      d.id === deviceId ? { ...d, status: d.status === 'on' ? 'off' : 'on', mode: 'manual' } : d
    ))
  }, [])

  const acknowledgeAlert = useCallback((alertId) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
  }, [])

  const acknowledgeAll = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
  }, [])

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), acknowledged: false, ...alert }, ...prev])
  }, [])

  const updateTask = useCallback((taskId, updates) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
  }, [])

  const addTask = useCallback((task) => {
    setTasks(prev => [...prev, { id: Date.now(), ...task }])
  }, [])

  const deleteTask = useCallback((taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }, [])

  const updateInventory = useCallback((itemId, updates) => {
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i))
  }, [])

  const addInventoryItem = useCallback((item) => {
    setInventory(prev => [...prev, { id: Date.now(), ...item }])
  }, [])

  const deleteInventoryItem = useCallback((itemId) => {
    setInventory(prev => prev.filter(i => i.id !== itemId))
  }, [])

  const addHarvestLog = useCallback((log) => {
    setHarvestLogs(prev => [...prev, { id: Date.now(), ...log }])
  }, [])

  const toggleAutomationRule = useCallback((ruleId) => {
    setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
  }, [])

  const addAutomationRule = useCallback((rule) => {
    setAutomationRules(prev => [...prev, { id: Date.now(), ...rule }])
  }, [])

  const deleteAutomationRule = useCallback((ruleId) => {
    setAutomationRules(prev => prev.filter(r => r.id !== ruleId))
  }, [])

  const updateRoom = useCallback((roomId, updates) => {
    setRooms(prev => prev.map(r => r.id === roomId ? { ...r, ...updates } : r))
  }, [])

  const addRoom = useCallback((room) => {
    const id = Date.now()
    setRooms(prev => [...prev, { id, status: 'optimal', ...room }])
    setSensors(prev => ({ ...prev, [id]: { temp: 21.0, humidity: 88.0, co2: 850, light: 400, moisture: 70 } }))
  }, [])

  const deleteRoom = useCallback((roomId) => {
    setRooms(prev => prev.filter(r => r.id !== roomId))
    setSensors(prev => { const n = { ...prev }; delete n[roomId]; return n })
    setDevices(prev => prev.filter(d => d.roomId !== roomId))
  }, [])

  const updateUser = useCallback((userId, updates) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u))
  }, [])

  const deleteUser = useCallback((userId) => {
    setUsers(prev => prev.filter(u => u.id !== userId))
  }, [])

  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length

  return (
    <FarmContext.Provider value={{
      farms, rooms, sensors, devices, alerts, tasks, inventory,
      harvestLogs, automationRules, users, lastUpdate,
      unacknowledgedCount, criticalCount,
      toggleDevice, acknowledgeAlert, acknowledgeAll, addAlert,
      updateTask, addTask, deleteTask,
      updateInventory, addInventoryItem, deleteInventoryItem,
      addHarvestLog, toggleAutomationRule, addAutomationRule, deleteAutomationRule,
      updateRoom, addRoom, deleteRoom, updateUser, deleteUser,
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
