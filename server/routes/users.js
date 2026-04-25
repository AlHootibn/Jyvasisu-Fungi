const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// GET /api/users
router.get('/', auth('Farm Owner'), async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT id, name, email, role, avatar, created_at FROM users ORDER BY id`
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/users/:id
router.put('/:id', auth('Farm Owner'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role, password } = req.body

    // Protect Super Admin from being edited
    const { rows: target } = await db.query('SELECT role FROM users WHERE id=$1', [id])
    if (!target[0]) return res.status(404).json({ error: 'User not found' })
    if (target[0].role === 'Super Admin') return res.status(403).json({ error: 'Super Admin cannot be modified' })

    const updates = []
    const vals = []
    let i = 1
    if (name)  { updates.push(`name=$${i++}`);  vals.push(name) }
    if (email) { updates.push(`email=$${i++}`); vals.push(email) }
    if (role && role !== 'Super Admin') { updates.push(`role=$${i++}`); vals.push(role) }
    if (password) {
      updates.push(`password_hash=$${i++}`)
      vals.push(bcrypt.hashSync(password, 10))
    }
    if (!updates.length) return res.status(400).json({ error: 'Nothing to update' })

    // Auto-update avatar from name
    if (name) { updates.push(`avatar=$${i++}`); vals.push(name.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)) }

    vals.push(id)
    const { rows } = await db.query(
      `UPDATE users SET ${updates.join(',')} WHERE id=$${i} RETURNING id,name,email,role,avatar,created_at`,
      vals
    )
    res.json(rows[0])
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// DELETE /api/users/:id
router.delete('/:id', auth('Super Admin'), async (req, res) => {
  try {
    const { id } = req.params
    const { rows } = await db.query('SELECT role FROM users WHERE id=$1', [id])
    if (!rows[0]) return res.status(404).json({ error: 'User not found' })
    if (rows[0].role === 'Super Admin') return res.status(403).json({ error: 'Super Admin cannot be deleted' })

    await db.query('DELETE FROM users WHERE id=$1', [id])
    res.json({ message: 'User deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router
