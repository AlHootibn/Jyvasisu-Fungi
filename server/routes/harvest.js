const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/harvest?room_id=1&days=30
router.get('/', auth(), async (req, res) => {
  try {
    const { room_id, days = 30 } = req.query
    const { rows } = await db.query(
      `SELECT h.*, r.name AS room_name
       FROM harvest_logs h JOIN rooms r ON h.room_id = r.id
       WHERE ($1::int IS NULL OR h.room_id=$1)
         AND h.date >= CURRENT_DATE - INTERVAL '${parseInt(days)} days'
       ORDER BY h.date DESC`,
      [room_id || null]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/harvest
router.post('/', auth('Farm Manager'), async (req, res) => {
  try {
    const { room_id, date, weight, quality, species, notes } = req.body
    const { rows } = await db.query(
      `INSERT INTO harvest_logs (room_id, date, weight, quality, species, notes)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [room_id, date || new Date().toISOString().slice(0, 10), weight, quality || 'A', species, notes]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/harvest/:id
router.delete('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    await db.query('DELETE FROM harvest_logs WHERE id=$1', [req.params.id])
    res.json({ message: 'Log deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
