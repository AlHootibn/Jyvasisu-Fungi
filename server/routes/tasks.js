const router = require('express').Router()
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/tasks?farm_id=1
router.get('/', auth(), async (req, res) => {
  try {
    const { farm_id } = req.query
    const { rows } = await db.query(
      `SELECT t.*, u.name AS assignee_name, r.name AS room_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       LEFT JOIN rooms r ON t.room_id = r.id
       WHERE ($1::int IS NULL OR t.farm_id=$1)
       ORDER BY t.due_date NULLS LAST, t.created_at DESC`,
      [farm_id || null]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/tasks
router.post('/', auth('Farm Manager'), async (req, res) => {
  try {
    const { farm_id, room_id, assigned_to, title, description, priority, due_date } = req.body
    const { rows } = await db.query(
      `INSERT INTO tasks (farm_id, room_id, assigned_to, title, description, priority, due_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [farm_id, room_id, assigned_to, title, description, priority || 'medium', due_date]
    )
    res.status(201).json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/tasks/:id
router.put('/:id', auth('Worker'), async (req, res) => {
  try {
    const { title, description, status, priority, assigned_to, due_date } = req.body
    const { rows } = await db.query(
      `UPDATE tasks SET
         title=COALESCE($1,title), description=COALESCE($2,description),
         status=COALESCE($3,status), priority=COALESCE($4,priority),
         assigned_to=COALESCE($5,assigned_to), due_date=COALESCE($6,due_date)
       WHERE id=$7 RETURNING *`,
      [title, description, status, priority, assigned_to, due_date, req.params.id]
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/tasks/:id
router.delete('/:id', auth('Farm Manager'), async (req, res) => {
  try {
    await db.query('DELETE FROM tasks WHERE id=$1', [req.params.id])
    res.json({ message: 'Task deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
