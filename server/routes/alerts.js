const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/alerts?farm_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { farm_id } = req.query
    const { rows } = await db.query(
      `SELECT a.*, r.name AS room_name
       FROM alerts a LEFT JOIN rooms r ON a.room_id = r.id
       WHERE ($1::int IS NULL OR a.farm_id=$1)
       ORDER BY a.created_at DESC LIMIT 100`,
      [farm_id || null]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/alerts
router.post('/', auth('Farm Manager'), async (req, res) => {
  try {
    const { farm_id, room_id, message, severity, type } = req.body
    const { rows } = await db.query(
      `INSERT INTO alerts (farm_id, room_id, message, severity, type)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [farm_id, room_id, message, severity || 'info', type || 'system']
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/alerts/:id/acknowledge
router.put('/:id/acknowledge', auth('Farm Manager'), async (req, res) => {
  try {
    const { rows } = await db.query(
      'UPDATE alerts SET acknowledged=true WHERE id=$1 RETURNING *',
      [req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/alerts/acknowledge-all
router.put('/acknowledge-all', auth('Farm Manager'), async (req, res) => {
  try {
    const { farm_id } = req.body
    await db.query(
      `UPDATE alerts SET acknowledged=true WHERE ($1::int IS NULL OR farm_id=$1)`,
      [farm_id || null]
    )
    res.json({ message: 'All alerts acknowledged' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
