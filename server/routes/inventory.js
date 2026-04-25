const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/inventory?farm_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { farm_id } = req.query
    const { rows } = await db.query(
      `SELECT * FROM inventory WHERE ($1::int IS NULL OR farm_id=$1) ORDER BY category, name`,
      [farm_id || null]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/inventory
router.post('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { farm_id, name, category, quantity, unit, min_quantity, cost, supplier } = req.body
    const { rows } = await db.query(
      `INSERT INTO inventory (farm_id, name, category, quantity, unit, min_quantity, cost, supplier)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [farm_id, name, category, quantity, unit, min_quantity || 0, cost || 0, supplier]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/inventory/:id
router.put('/:id', auth('Farm Manager'), async (req, res) => {
  try {
    const { name, category, quantity, unit, min_quantity, cost, supplier } = req.body
    const { rows } = await db.query(
      `UPDATE inventory SET
         name=COALESCE($1,name), category=COALESCE($2,category),
         quantity=COALESCE($3,quantity), unit=COALESCE($4,unit),
         min_quantity=COALESCE($5,min_quantity), cost=COALESCE($6,cost),
         supplier=COALESCE($7,supplier),
         last_restocked=CASE WHEN $3 IS NOT NULL THEN NOW() ELSE last_restocked END
       WHERE id=$8 RETURNING *`,
      [name, category, quantity, unit, min_quantity, cost, supplier, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/inventory/:id
router.delete('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    await db.query('DELETE FROM inventory WHERE id=$1', [req.params.id])
    res.json({ message: 'Item deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
