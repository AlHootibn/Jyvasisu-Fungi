const jwt = require('jsonwebtoken')
require('dotenv').config()

const JWT_SECRET = process.env.JWT_SECRET || 'jyvasisu-dev-secret'

const ROLE_HIERARCHY = ['Viewer', 'Worker', 'Farm Manager', 'Farm Owner', 'Super Admin']

function auth(minRole = 'Viewer') {
  return (req, res, next) => {
    const header = req.headers.authorization
    if (!header?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing token' })
    }
    try {
      const payload = jwt.verify(header.slice(7), JWT_SECRET)
      req.user = payload

      const userLevel     = ROLE_HIERARCHY.indexOf(payload.role)
      const requiredLevel = ROLE_HIERARCHY.indexOf(minRole)
      if (userLevel < requiredLevel) {
        return res.status(403).json({ error: 'Insufficient permissions' })
      }
      next()
    } catch {
      return res.status(401).json({ error: 'Invalid or expired token' })
    }
  }
}

function signToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role, avatar: user.avatar },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

module.exports = { auth, signToken }
