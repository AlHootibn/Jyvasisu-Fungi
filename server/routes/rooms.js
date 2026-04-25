const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/rooms?farm_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { farm_id } = req.query
    const query = farm_id
      ? 'SELECT * FROM rooms WHERE farm_id=$1 ORDER BY id'
      : 'SELECT * FROM rooms ORDER BY id'
    const { rows } = await db.query(query, farm_id ? [farm_id] : [])
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/rooms/:id
router.get('/:id', auth(), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM rooms WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Room not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/rooms
router.post('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { farm_id, name, type, species, capacity, current_batch, batch_start_date, expected_harvest } = req.body
    const { rows } = await db.query(
      `INSERT INTO rooms (farm_id, name, type, species, capacity, current_batch, batch_start_date, expected_harvest)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [farm_id, name, type, species, capacity, current_batch, batch_start_date, expected_harvest]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/rooms/:id
router.put('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    const { name, type, species, capacity, status, current_batch, batch_start_date, expected_harvest } = req.body
    const { rows } = await db.query(
      `UPDATE rooms SET
         name=COALESCE($1,name), type=COALESCE($2,type), species=COALESCE($3,species),
         capacity=COALESCE($4,capacity), status=COALESCE($5,status),
         current_batch=COALESCE($6,current_batch),
         batch_start_date=COALESCE($7,batch_start_date),
         expected_harvest=COALESCE($8,expected_harvest)
       WHERE id=$9 RETURNING *`,
      [name, type, species, capacity, status, current_batch, batch_start_date, expected_harvest, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/rooms/:id
router.delete('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    await db.query('DELETE FROM rooms WHERE id=$1', [req.params.id])
    res.json({ message: 'Room deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
