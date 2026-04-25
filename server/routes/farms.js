const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/farms
router.get('/', auth(), async (req, res) => {
  try {
    const { rows } = await db.query(`SELECT * FROM farms ORDER BY id`)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/farms/:id
router.get('/:id', auth(), async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM farms WHERE id=$1', [req.params.id])
    if (!rows[0]) return res.status(404).json({ error: 'Farm not found' })
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/farms
router.post('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { name, location, area, description, established } = req.body
    const { rows } = await db.query(
      `INSERT INTO farms (name, location, area, description, established, owner_id)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, location, area, description, established, req.user.id]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/farms/:id
router.put('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    const { name, location, area, description, status } = req.body
    const { rows } = await db.query(
      `UPDATE farms SET name=COALESCE($1,name), location=COALESCE($2,location),
       area=COALESCE($3,area), description=COALESCE($4,description), status=COALESCE($5,status)
       WHERE id=$6 RETURNING *`,
      [name, location, area, description, status, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
