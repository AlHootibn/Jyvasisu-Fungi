const router = require('express').Router()
const bcrypt = require('bcryptjs')
const db = require('../config/db')
const { signToken, auth } = require('../middleware/auth')

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const { rows } = await db.query('SELECT * FROM users WHERE email = $1', [email])
    const user = rows[0]
    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = signToken(user)
    const { password_hash: _, ...safe } = user
    res.json({ token, user: safe })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/register
router.post('/register', auth('Super Admin'), async (req, res) => {
  try {
    const { name, email, password, role = 'Worker', avatar } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'name, email, password required' })

    const hash = bcrypt.hashSync(password, 10)
    const initials = avatar || name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    const { rows } = await db.query(
      `INSERT INTO users (name, email, password_hash, role, avatar) VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, email, hash, role, initials]
    )
    const { password_hash: _, ...safe } = rows[0]
    res.status(201).json(safe)
  } catch (err) {
    if (err.code === '23505') return res.status(409).json({ error: 'Email already in use' })
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', auth(), (req, res) => {
  res.json(req.user)
})

module.exports = router
