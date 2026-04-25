// API Service — connects the frontend to the real backend
// Set VITE_API_URL in client/.env to override the default

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  try {
    const u = JSON.parse(localStorage.getItem('farmiq_user') || '{}')
    return u.token || null
  } catch { return null }
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }

  return res.json()
}

const get  = (path)        => request('GET',    path)
const post = (path, body)  => request('POST',   path, body)
const put  = (path, body)  => request('PUT',    path, body)
const del  = (path)        => request('DELETE', path)

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login:    (email, password)  => post('/api/auth/login', { email, password }),
  register: (data)             => post('/api/auth/register', data),
  me:       ()                 => get('/api/auth/me'),
  health:   ()                 => get('/api/health'),

  // ── Users ─────────────────────────────────────────────────────────────────
  getUsers:    ()              => get('/api/users'),
  updateUser:  (id, data)      => put(`/api/users/${id}`, data),
  deleteUser:  (id)            => del(`/api/users/${id}`),

  // ── Farms ─────────────────────────────────────────────────────────────────
  getFarms:    ()              => get('/api/farms'),
  getFarm:     (id)            => get(`/api/farms/${id}`),
  createFarm:  (data)          => post('/api/farms', data),
  updateFarm:  (id, data)      => put(`/api/farms/${id}`, data),

  // ── Rooms ─────────────────────────────────────────────────────────────────
  getRooms:    (farmId)        => get(`/api/rooms?farm_id=${farmId}`),
  createRoom:  (data)          => post('/api/rooms', data),
  updateRoom:  (id, data)      => put(`/api/rooms/${id}`, data),
  deleteRoom:  (id)            => del(`/api/rooms/${id}`),

  // ── Devices ───────────────────────────────────────────────────────────────
  getDevices:    (roomId)      => get(`/api/devices?room_id=${roomId}`),
  getAllDevices:  ()            => get('/api/devices'),
  createDevice:  (data)        => post('/api/devices', data),
  controlDevice: (id, status)  => put(`/api/devices/${id}/control`, { status, mode: 'manual' }),
  deleteDevice:  (id)          => del(`/api/devices/${id}`),

  // ── Sensors ───────────────────────────────────────────────────────────────
  getLatestSensors: ()         => get('/api/sensor-data/latest'),
  getSensorHistory: (roomId, hours = 24) => get(`/api/sensor-data/${roomId}?hours=${hours}`),
  postSensorData:   (data)     => post('/api/sensor-data', data),  // used by IoT devices

  // ── Automation ────────────────────────────────────────────────────────────
  getRules:    (farmId)        => get(`/api/automation?farm_id=${farmId}`),
  createRule:  (data)          => post('/api/automation', data),
  updateRule:  (id, data)      => put(`/api/automation/${id}`, data),
  deleteRule:  (id)            => del(`/api/automation/${id}`),
  toggleRule:  (id, isActive)  => put(`/api/automation/${id}`, { is_active: isActive }),

  // ── Alerts ────────────────────────────────────────────────────────────────
  getAlerts:      (farmId)     => get(`/api/alerts?farm_id=${farmId}`),
  acknowledgeAlert: (id)       => put(`/api/alerts/${id}/acknowledge`),
  acknowledgeAll:  (farmId)    => put('/api/alerts/acknowledge-all', { farm_id: farmId }),

  // ── Tasks ─────────────────────────────────────────────────────────────────
  getTasks:    (farmId)        => get(`/api/tasks?farm_id=${farmId}`),
  createTask:  (data)          => post('/api/tasks', data),
  updateTask:  (id, data)      => put(`/api/tasks/${id}`, data),
  deleteTask:  (id)            => del(`/api/tasks/${id}`),

  // ── Harvest ───────────────────────────────────────────────────────────────
  getHarvest:   (roomId, days) => get(`/api/harvest?${roomId ? `room_id=${roomId}&` : ''}days=${days || 30}`),
  logHarvest:   (data)         => post('/api/harvest', data),
  deleteHarvest:(id)           => del(`/api/harvest/${id}`),

  // ── Inventory ─────────────────────────────────────────────────────────────
  getInventory:    (farmId)    => get(`/api/inventory?farm_id=${farmId}`),
  createInventory: (data)      => post('/api/inventory', data),
  updateInventory: (id, data)  => put(`/api/inventory/${id}`, data),
  deleteInventory: (id)        => del(`/api/inventory/${id}`),
}

// WebSocket helper
export function connectWebSocket(onMessage) {
  const WS_URL = BASE.replace(/^http/, 'ws') + '/ws'
  let ws
  let reconnectTimer

  function connect() {
    ws = new WebSocket(WS_URL)
    ws.onopen    = () => console.log('WS connected')
    ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)) } catch {} }
    ws.onclose   = () => { reconnectTimer = setTimeout(connect, 3000) }
    ws.onerror   = () => ws.close()
  }

  connect()
  return () => { clearTimeout(reconnectTimer); ws?.close() }
}
