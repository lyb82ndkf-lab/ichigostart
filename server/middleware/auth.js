const crypto = require('crypto')
const { pool } = require('../db')

const TOKEN_SECRET = 'ichigo-token-secret-2024'

function signToken(userId, username) {
  const payload = `${userId}:${username}:${Date.now()}`
  const sig = crypto.createHmac('sha256', TOKEN_SECRET).update(payload).digest('hex')
  return Buffer.from(`${payload}:${sig}`).toString('base64')
}

function verifyToken(token) {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const parts = decoded.split(':')
    if (parts.length < 4) return null
    const [userId, username, ts, sig] = [parts[0], parts[1], parts[2], parts[3]]
    const expected = crypto.createHmac('sha256', TOKEN_SECRET).update(`${userId}:${username}:${ts}`).digest('hex')
    if (sig !== expected) return null
    return { userId: parseInt(userId), username }
  } catch {
    return null
  }
}

// 认证中间件：支持 token 和 session 两种方式
async function authMiddleware(req, res, next) {
  // 优先检查 token
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7)
    const data = verifyToken(token)
    if (data) {
      req.userId = data.userId
      req.username = data.username
      return next()
    }
  }

  // fallback 到 session
  if (req.session && req.session.userId) {
    req.userId = req.session.userId
    req.username = req.session.username
    return next()
  }

  return res.status(401).json({ error: '未登录' })
}

module.exports = { signToken, verifyToken, authMiddleware }
