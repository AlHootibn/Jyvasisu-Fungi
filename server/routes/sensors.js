const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// POST /api/sensor-data  — IoT device posts here
// Authenticated by api_key in header: X-API-Key: <device api_key>
router.post('/', async (req, res) => {
  try {
    const apiKey = req.headers['x-api-key']
    let roomId = req.body.room_id
    let deviceId = null

    if (apiKey) {
      const { rows } = await db.query('SELECT id, room_id FROM devices WHERE api_key=$1', [apiKey])
      if (!rows[0]) return res.status(401).json({ error: 'Invalid API key' })
      deviceId = rows[0].id
      roomId = rows[0].room_id
    } else if (!roomId) {
      return res.status(400).json({ error: 'room_id or X-API-Key required' })
    }

    const { temperature, humidity, co2, light, moisture } = req.body
    const { rows } = await db.query(
      `INSERT INTO sensor_data (device_id, room_id, temperature, humidity, co2, light, moisture)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [deviceId, roomId, temperature, humidity, co2, light, moisture]
    )

    // Broadcast to WebSocket clients (attached to app by main server)
    if (req.app.locals.broadcast) {
      req.app.locals.broadcast({ type: 'sensor_update', roomId, data: rows[0] })
    }

    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/sensor-data/latest  — latest reading per room
router.get('/latest', auth(), async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT DISTINCT ON (room_id)
        room_id, temperature, humidity, co2, light, moisture, created_at
      FROM sensor_data
      ORDER BY room_id, created_at DESC
    `)
    // Return as object keyed by room_id
    const map = {}
    for (const r of rows) {
      map[r.room_id] = {
        temp:     r.temperature,
        humidity: r.humidity,
        co2:      r.co2,
        light:    r.light,
        moisture: r.moisture,
        updatedAt: r.created_at,
      }
    }
    res.json(map)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/sensor-data/:room_id?hours=24
// Returns up to ~144 time-bucketed (10-min avg) readings to keep payload small
router.get('/:room_id', auth(), async (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 24
    const { rows } = await db.query(
      `SELECT
         ROUND(AVG(temperature)::numeric, 1) AS temperature,
         ROUND(AVG(humidity)::numeric, 1)    AS humidity,
         ROUND(AVG(co2))::int                AS co2,
         ROUND(AVG(light))::int              AS light,
         ROUND(AVG(moisture)::numeric, 1)    AS moisture,
         to_timestamp(FLOOR(EXTRACT(EPOCH FROM created_at) / 600) * 600) AS created_at
       FROM sensor_data
       WHERE room_id=$1 AND created_at > NOW() - INTERVAL '${hours} hours'
       GROUP BY FLOOR(EXTRACT(EPOCH FROM created_at) / 600)
       ORDER BY created_at ASC`,
      [req.params.room_id]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
