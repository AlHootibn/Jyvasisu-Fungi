const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { WebSocketServer } = require('ws')
const http = require('http')

const app = express()
const server = http.createServer(app)
const wss = new WebSocketServer({ server, path: '/ws' })

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())

const JWT_SECRET = process.env.JWT_SECRET || 'farmiq-dev-secret-2026'

const USERS = [
  { id: 1, name: 'Ahmad Hassan', email: 'admin@farm.com', passwordHash: bcrypt.hashSync('admin123', 10), role: 'Super Admin' },
  { id: 2, name: 'Sara Al-Rashid', email: 'owner@farm.com', passwordHash: bcrypt.hashSync('owner123', 10), role: 'Farm Owner' },
  { id: 3, name: 'Omar Khalid', email: 'manager@farm.com', passwordHash: bcrypt.hashSync('manager123', 10), role: 'Farm Manager' },
  { id: 4, name: 'Laila Nasser', email: 'worker@farm.com', passwordHash: bcrypt.hashSync('worker123', 10), role: 'Worker' },
]

let sensorState = {
  1: { temp: 21.2, humidity: 89.5, co2: 820, light: 450, moisture: 72 },
  2: { temp: 22.8, humidity: 78.3, co2: 1150, light: 380, moisture: 65 },
  3: { temp: 26.4, humidity: 82.1, co2: 1680, light: 510, moisture: 58 },
}

function simulateSensors() {
  for (const id in sensorState) {
    const s = sensorState[id]
    sensorState[id] = {
      temp: parseFloat((s.temp + (Math.random() - 0.5) * 0.4).toFixed(1)),
      humidity: parseFloat((s.humidity + (Math.random() - 0.5) * 1.2).toFixed(1)),
      co2: Math.round(s.co2 + (Math.random() - 0.5) * 30),
      light: Math.round(s.light + (Math.random() - 0.5) * 20),
      moisture: parseFloat((s.moisture + (Math.random() - 0.5) * 0.5).toFixed(1)),
    }
  }
  return sensorState
}

setInterval(() => {
  const data = simulateSensors()
  const msg = JSON.stringify({ type: 'sensor_update', data, timestamp: new Date().toISOString() })
  wss.clients.forEach(client => {
    if (client.readyState === 1) client.send(msg)
  })
}, 3000)

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: 'connected', message: 'FarmIQ WebSocket connected' }))
  ws.send(JSON.stringify({ type: 'sensor_update', data: sensorState, timestamp: new Date().toISOString() }))
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  const user = USERS.find(u => u.email === email)
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ error: 'Invalid credentials' })
  }
  const { passwordHash: _, ...safe } = user
  const token = jwt.sign(safe, JWT_SECRET, { expiresIn: '7d' })
  res.json({ token, user: safe })
})

app.get('/api/sensors', (req, res) => {
  res.json(sensorState)
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
})

const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`\n🍄 FarmIQ Backend running on http://localhost:${PORT}`)
  console.log(`📡 WebSocket available at ws://localhost:${PORT}/ws`)
  console.log(`\nDemo credentials:`)
  console.log(`  Super Admin: admin@farm.com / admin123`)
  console.log(`  Farm Manager: manager@farm.com / manager123`)
  console.log(`  Worker: worker@farm.com / worker123\n`)
})
