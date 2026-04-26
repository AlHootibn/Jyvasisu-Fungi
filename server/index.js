require('dotenv').config()
const express = require('express')
const cors = require('cors')
const http = require('http')
const { WebSocketServer } = require('ws')
const { startAutomationEngine } = require('./services/automation')
const { startSensorSimulator } = require('./services/sensorSimulator')

const app    = express()
const server = http.createServer(app)
const wss    = new WebSocketServer({ server, path: '/ws' })

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }))
app.use(express.json())

// ─── WebSocket ────────────────────────────────────────────────────────────────
function broadcast(payload) {
  const msg = JSON.stringify(payload)
  wss.clients.forEach(ws => { if (ws.readyState === 1) ws.send(msg) })
}

app.locals.broadcast = broadcast

wss.on('connection', (ws, req) => {
  console.log(`WS client connected (${wss.clients.size} total)`)
  ws.send(JSON.stringify({ type: 'connected', message: 'JyväSisu Fungi WebSocket ready' }))

  ws.on('message', (raw) => {
    try {
      const msg = JSON.parse(raw)
      // Client can send { type: 'ping' }
      if (msg.type === 'ping') ws.send(JSON.stringify({ type: 'pong' }))
    } catch {}
  })

  ws.on('close', () => console.log(`WS client disconnected (${wss.clients.size} remaining)`))
})

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth',        require('./routes/auth'))
app.use('/api/users',       require('./routes/users'))
app.use('/api/farms',       require('./routes/farms'))
app.use('/api/rooms',       require('./routes/rooms'))
app.use('/api/devices',     require('./routes/devices'))
app.use('/api/sensor-data', require('./routes/sensors'))
app.use('/api/automation',  require('./routes/automation'))
app.use('/api/alerts',      require('./routes/alerts'))
app.use('/api/tasks',       require('./routes/tasks'))
app.use('/api/harvest',     require('./routes/harvest'))
app.use('/api/inventory',   require('./routes/inventory'))

// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: Math.round(process.uptime()), timestamp: new Date().toISOString() })
})

// 404
app.use((req, res) => res.status(404).json({ error: `Route ${req.method} ${req.path} not found` }))

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: err.message })
})

// ─── Start ────────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log(`\n🍄 JyväSisu Fungi Backend`)
  console.log(`   API  → http://localhost:${PORT}/api`)
  console.log(`   WS   → ws://localhost:${PORT}/ws`)
  console.log(`   Health → http://localhost:${PORT}/api/health\n`)
  startAutomationEngine(broadcast)
  startSensorSimulator(broadcast)
})
