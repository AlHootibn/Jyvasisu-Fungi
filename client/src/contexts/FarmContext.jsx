import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { api, connectWebSocket } from '../services/api'
import { useToast } from './ToastContext'

const FarmContext = createContext(null)

// ── Normalizers (snake_case DB → camelCase frontend) ───────────────────────
const normalizeRoom = (r) => ({
  ...r,
  farmId: r.farm_id,
  currentBatch: r.current_batch,
  expectedHarvest: r.expected_harvest,
  batchStartDate: r.batch_start_date,
})

const normalizeDevice = (d) => ({
  ...d,
  roomId: d.room_id,
})

const normalizeAlert = (a) => ({
  ...a,
  roomName: a.room_name || '',
  timestamp: a.created_at,
})

const normalizeTask = (t) => ({
  ...t,
  roomId: t.room_id,
  assignedTo: t.assigned_to,
  dueDate: t.due_date ? t.due_date.split('T')[0] : t.due_date,
})

const normalizeRule = (r) => ({
  id: r.id,
  name: r.name,
  description: r.description || '',
  isActive: r.is_active,
  priority: r.priority,
  roomId: r.room_id,
  farmId: r.farm_id,
  condition: {
    sensor: r.condition_sensor,
    operator: r.operator,
    value: parseFloat(r.condition_value),
  },
  action: {
    device: r.action_device,
    state: r.action_state,
  },
})

const normalizeHarvest = (h) => ({
  ...h,
  roomId: h.room_id,
  roomName: h.room_name || '',
  weight: parseFloat(h.weight) || 0,
  date: h.date ? h.date.split('T')[0] : (h.created_at ? h.created_at.split('T')[0] : ''),
})

const normalizeInventory = (i) => ({
  ...i,
  farmId: i.farm_id,
  minQuantity: i.min_quantity,
  lastRestocked: i.last_restocked,
})

// ── Provider ───────────────────────────────────────────────────────────────
export function FarmProvider({ children }) {
  const { showToast } = useToast()

  const [farms, setFarms] = useState([])
  const [rooms, setRooms] = useState([])
  const [sensors, setSensors] = useState({})
  const [devices, setDevices] = useState([])
  const [alerts, setAlerts] = useState([])
  const [tasks, setTasks] = useState([])
  const [inventory, setInventory] = useState([])
  const [harvestLogs, setHarvestLogs] = useState([])
  const [automationRules, setAutomationRules] = useState([])
  const [users, setUsers] = useState([])
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [wsConnected, setWsConnected] = useState(false)
  const wsCleanupRef = useRef(null)

  // ── Initial data load ────────────────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      try {
        const [
          farmsData, roomsData, devicesData, sensorsData,
          alertsData, tasksData, inventoryData, harvestData,
          rulesData, usersData,
        ] = await Promise.all([
          api.getFarms(),
          api.getRooms(1),
          api.getAllDevices(),
          api.getLatestSensors(),
          api.getAlerts(1),
          api.getTasks(1),
          api.getInventory(1),
          api.getHarvest(null, 90),
          api.getRules(1),
          api.getUsers(),
        ])

        setFarms(farmsData)
        setRooms(roomsData.map(normalizeRoom))
        setDevices(devicesData.map(normalizeDevice))
        setSensors(sensorsData)
        setAlerts(alertsData.map(normalizeAlert))
        setTasks(tasksData.map(normalizeTask))
        setInventory(inventoryData.map(normalizeInventory))
        setHarvestLogs(harvestData.map(normalizeHarvest))
        setAutomationRules(rulesData.map(normalizeRule))
        setUsers(usersData)
      } catch (err) {
        showToast(`Failed to load farm data: ${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadAll()
  }, [])

  // ── WebSocket for live sensor + device updates ────────────────────────────
  useEffect(() => {
    const cleanup = connectWebSocket(
      (msg) => {
        if (msg.type === 'sensor_update') {
          setSensors(prev => ({ ...prev, [msg.roomId]: msg.data }))
          setLastUpdate(new Date())
        } else if (msg.type === 'device_update') {
          setDevices(prev => prev.map(d =>
            d.id === msg.deviceId ? { ...d, status: msg.status, mode: msg.mode } : d
          ))
        } else if (msg.type === 'new_alert') {
          setAlerts(prev => [normalizeAlert(msg.alert), ...prev])
        }
      },
      () => setWsConnected(true),
      () => setWsConnected(false),
    )
    wsCleanupRef.current = cleanup
    return cleanup
  }, [])

  // ── Devices ──────────────────────────────────────────────────────────────
  const toggleDevice = useCallback(async (deviceId) => {
    const device = devices.find(d => d.id === deviceId)
    if (!device) return
    const newStatus = device.status === 'on' ? 'off' : 'on'
    try {
      await api.controlDevice(deviceId, newStatus)
      setDevices(prev => prev.map(d =>
        d.id === deviceId ? { ...d, status: newStatus, mode: 'manual' } : d
      ))
    } catch (err) {
      showToast(err.message)
    }
  }, [devices])

  // ── Alerts ───────────────────────────────────────────────────────────────
  const acknowledgeAlert = useCallback(async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId)
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, acknowledged: true } : a))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const acknowledgeAll = useCallback(async () => {
    try {
      await api.acknowledgeAll(1)
      setAlerts(prev => prev.map(a => ({ ...a, acknowledged: true })))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const addAlert = useCallback((alert) => {
    setAlerts(prev => [{ id: Date.now(), timestamp: new Date().toISOString(), acknowledged: false, ...alert }, ...prev])
  }, [])

  // ── Tasks ────────────────────────────────────────────────────────────────
  const updateTask = useCallback(async (taskId, updates) => {
    try {
      const apiUpdates = {}
      if (updates.status !== undefined)     apiUpdates.status      = updates.status
      if (updates.title !== undefined)      apiUpdates.title       = updates.title
      if (updates.priority !== undefined)   apiUpdates.priority    = updates.priority
      if (updates.assignedTo !== undefined) apiUpdates.assigned_to = updates.assignedTo
      if (updates.dueDate !== undefined)    apiUpdates.due_date    = updates.dueDate
      await api.updateTask(taskId, apiUpdates)
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updates } : t))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const addTask = useCallback(async (task) => {
    try {
      const result = await api.createTask({
        farm_id: 1,
        room_id: task.roomId || null,
        assigned_to: task.assignedTo,
        title: task.title,
        description: task.description,
        priority: task.priority,
        due_date: task.dueDate,
      })
      setTasks(prev => [...prev, normalizeTask(result)])
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteTask = useCallback(async (taskId) => {
    try {
      await api.deleteTask(taskId)
      setTasks(prev => prev.filter(t => t.id !== taskId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Inventory ────────────────────────────────────────────────────────────
  const updateInventory = useCallback(async (itemId, updates) => {
    try {
      const apiUpdates = {}
      if (updates.name !== undefined)         apiUpdates.name         = updates.name
      if (updates.category !== undefined)     apiUpdates.category     = updates.category
      if (updates.quantity !== undefined)     apiUpdates.quantity     = updates.quantity
      if (updates.unit !== undefined)         apiUpdates.unit         = updates.unit
      if (updates.cost !== undefined)         apiUpdates.cost         = updates.cost
      if (updates.supplier !== undefined)     apiUpdates.supplier     = updates.supplier
      if (updates.minQuantity !== undefined)  apiUpdates.min_quantity = updates.minQuantity
      if (updates.min_quantity !== undefined) apiUpdates.min_quantity = updates.min_quantity
      const result = await api.updateInventory(itemId, apiUpdates)
      setInventory(prev => prev.map(i => i.id === itemId ? normalizeInventory(result) : i))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const addInventoryItem = useCallback(async (item) => {
    try {
      const result = await api.createInventory({
        farm_id: 1,
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        unit: item.unit,
        min_quantity: item.minQuantity ?? item.min_quantity ?? 0,
        cost: item.cost ?? 0,
        supplier: item.supplier,
      })
      setInventory(prev => [...prev, normalizeInventory(result)])
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteInventoryItem = useCallback(async (itemId) => {
    try {
      await api.deleteInventory(itemId)
      setInventory(prev => prev.filter(i => i.id !== itemId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Harvest ──────────────────────────────────────────────────────────────
  const addHarvestLog = useCallback(async (log) => {
    try {
      const result = await api.logHarvest({
        room_id: log.roomId || log.room_id,
        date:    log.date,
        weight:  log.weight,
        quality: log.quality,
        species: log.species,
        notes:   log.notes,
      })
      setHarvestLogs(prev => [...prev, normalizeHarvest(result)])
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteHarvestLog = useCallback(async (logId) => {
    try {
      await api.deleteHarvest(logId)
      setHarvestLogs(prev => prev.filter(h => h.id !== logId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Automation ───────────────────────────────────────────────────────────
  const toggleAutomationRule = useCallback(async (ruleId) => {
    const rule = automationRules.find(r => r.id === ruleId)
    if (!rule) return
    try {
      await api.toggleRule(ruleId, !rule.isActive)
      setAutomationRules(prev => prev.map(r => r.id === ruleId ? { ...r, isActive: !r.isActive } : r))
    } catch (err) {
      showToast(err.message)
    }
  }, [automationRules])

  const addAutomationRule = useCallback(async (rule) => {
    try {
      const result = await api.createRule({
        farm_id: 1,
        room_id: rule.roomId || null,
        name: rule.name,
        description: rule.description,
        condition_sensor: rule.condition.sensor,
        operator: rule.condition.operator,
        condition_value: rule.condition.value,
        action_device: rule.action.device,
        action_state: rule.action.state,
        priority: rule.priority || 1,
      })
      setAutomationRules(prev => [...prev, normalizeRule(result)])
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteAutomationRule = useCallback(async (ruleId) => {
    try {
      await api.deleteRule(ruleId)
      setAutomationRules(prev => prev.filter(r => r.id !== ruleId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Rooms ────────────────────────────────────────────────────────────────
  const updateRoom = useCallback(async (roomId, updates) => {
    try {
      const apiUpdates = {}
      if (updates.name !== undefined)            apiUpdates.name             = updates.name
      if (updates.type !== undefined)            apiUpdates.type             = updates.type
      if (updates.species !== undefined)         apiUpdates.species          = updates.species
      if (updates.status !== undefined)          apiUpdates.status           = updates.status
      if (updates.currentBatch !== undefined)    apiUpdates.current_batch    = updates.currentBatch
      if (updates.expectedHarvest !== undefined) apiUpdates.expected_harvest = updates.expectedHarvest
      if (updates.batchStartDate !== undefined)  apiUpdates.batch_start_date = updates.batchStartDate
      const result = await api.updateRoom(roomId, apiUpdates)
      setRooms(prev => prev.map(r => r.id === roomId ? normalizeRoom(result) : r))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const addRoom = useCallback(async (room) => {
    try {
      const result = await api.createRoom({
        farm_id: 1,
        name: room.name,
        type: room.type,
        species: room.species,
        current_batch: room.currentBatch || room.current_batch,
        expected_harvest: room.expectedHarvest || room.expected_harvest,
        batch_start_date: room.batchStartDate || room.batch_start_date,
        capacity: room.capacity,
      })
      const normalized = normalizeRoom(result)
      setRooms(prev => [...prev, normalized])
      setSensors(prev => ({ ...prev, [normalized.id]: { temp: 21.0, humidity: 88.0, co2: 850, light: 400, moisture: 70 } }))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteRoom = useCallback(async (roomId) => {
    try {
      await api.deleteRoom(roomId)
      setRooms(prev => prev.filter(r => r.id !== roomId))
      setSensors(prev => { const n = { ...prev }; delete n[roomId]; return n })
      setDevices(prev => prev.filter(d => d.roomId !== roomId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Users ────────────────────────────────────────────────────────────────
  const addUser = useCallback(async (userData) => {
    try {
      const result = await api.register(userData)
      setUsers(prev => [...prev, result])
      return { success: true }
    } catch (err) {
      return { success: false, error: err.message }
    }
  }, [])

  const updateUser = useCallback(async (userId, updates) => {
    try {
      const result = await api.updateUser(userId, updates)
      setUsers(prev => prev.map(u => u.id === userId ? result : u))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  const deleteUser = useCallback(async (userId) => {
    try {
      await api.deleteUser(userId)
      setUsers(prev => prev.filter(u => u.id !== userId))
    } catch (err) {
      showToast(err.message)
    }
  }, [])

  // ── Derived counts ────────────────────────────────────────────────────────
  const unacknowledgedCount = alerts.filter(a => !a.acknowledged).length
  const criticalCount = alerts.filter(a => !a.acknowledged && a.severity === 'critical').length

  return (
    <FarmContext.Provider value={{
      farms, rooms, sensors, devices, alerts, tasks, inventory,
      harvestLogs, automationRules, users, lastUpdate, loading, wsConnected,
      unacknowledgedCount, criticalCount,
      toggleDevice, acknowledgeAlert, acknowledgeAll, addAlert,
      updateTask, addTask, deleteTask,
      updateInventory, addInventoryItem, deleteInventoryItem,
      addHarvestLog, deleteHarvestLog,
      toggleAutomationRule, addAutomationRule, deleteAutomationRule,
      updateRoom, addRoom, deleteRoom, addUser, updateUser, deleteUser,
    }}>
      {children}
    </FarmContext.Provider>
  )
}

export const useFarm = () => useContext(FarmContext)
