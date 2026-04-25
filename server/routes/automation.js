const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/automation?farm_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { farm_id, room_id } = req.query
    let query = 'SELECT * FROM automation_rules WHERE 1=1'
    const vals = []
    if (farm_id) { vals.push(farm_id); query += ` AND farm_id=$${vals.length}` }
    if (room_id) { vals.push(room_id); query += ` AND room_id=$${vals.length}` }
    query += ' ORDER BY priority, id'
    const { rows } = await db.query(query, vals)
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/automation
router.post('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { farm_id, room_id, name, description, condition_sensor, operator,
            condition_value, action_device, action_state, priority } = req.body
    const { rows } = await db.query(
      `INSERT INTO automation_rules
         (farm_id, room_id, name, description, condition_sensor, operator,
          condition_value, action_device, action_state, priority)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [farm_id, room_id, name, description, condition_sensor, operator,
       condition_value, action_device, action_state, priority || 1]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/automation/:id
router.put('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    const { name, description, condition_sensor, operator, condition_value,
            action_device, action_state, priority, is_active } = req.body
    const { rows } = await db.query(
      `UPDATE automation_rules SET
         name=COALESCE($1,name), description=COALESCE($2,description),
         condition_sensor=COALESCE($3,condition_sensor), operator=COALESCE($4,operator),
         condition_value=COALESCE($5,condition_value), action_device=COALESCE($6,action_device),
         action_state=COALESCE($7,action_state), priority=COALESCE($8,priority),
         is_active=COALESCE($9,is_active)
       WHERE id=$10 RETURNING *`,
      [name, description, condition_sensor, operator, condition_value,
       action_device, action_state, priority, is_active, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/automation/:id
router.delete('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    await db.query('DELETE FROM automation_rules WHERE id=$1', [req.params.id])
    res.json({ message: 'Rule deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
