const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/devices?room_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { room_id } = req.query
    const query = room_id
      ? 'SELECT * FROM devices WHERE room_id=$1 ORDER BY id'
      : 'SELECT * FROM devices ORDER BY id'
    const { rows } = await db.query(query, room_id ? [room_id] : [])
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/devices
router.post('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { room_id, name, type, power, mode } = req.body
    const { rows } = await db.query(
      `INSERT INTO devices (room_id, name, type, power, mode) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [room_id, name, type, power || 0, mode || 'auto']
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/devices/:id/control  — toggle ON/OFF
router.put('/:id/control', auth('Farm Manager'), async (req, res) => {
  try {
    const { status, mode } = req.body
    const { rows } = await db.query(
      `UPDATE devices SET status=COALESCE($1,status), mode=COALESCE($2,mode) WHERE id=$3 RETURNING *`,
      [status, mode, req.params.id]
    )
    if (!rows[0]) return res.status(404).json({ error: 'Device not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/devices/:id
router.delete('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    await db.query('DELETE FROM devices WHERE id=$1', [req.params.id])
    res.json({ message: 'Device deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
