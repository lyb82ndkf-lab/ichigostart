const express = require('express')
const bcrypt = require('bcryptjs')
const { pool } = require('../db')
const { signToken, authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 注册
router.post('/register', async (req, res) => {
  try {
    const { username, password, nickname } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度需要 3-20 个字符' })
    }
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少 6 个字符' })
    }

    const [existing] = await pool.execute('SELECT id FROM users WHERE username = ?', [username])
    if (existing.length > 0) {
      return res.status(400).json({ error: '用户名已被注册' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const [result] = await pool.execute(
      'INSERT INTO users (username, password, nickname) VALUES (?, ?, ?)',
      [username, hashedPassword, nickname || username]
    )

    const defaultCategories = ['常用网站', '工作工具', '学习资源', '娱乐休闲']
    for (let i = 0; i < defaultCategories.length; i++) {
      await pool.execute(
        'INSERT INTO categories (user_id, name, sort_order) VALUES (?, ?, ?)',
        [result.insertId, defaultCategories[i], i]
      )
    }

    const defaultBookmarks = [
      { category: '常用网站', title: '百度', url: 'https://www.baidu.com' },
      { category: '常用网站', title: 'Google', url: 'https://www.google.com' },
      { category: '工作工具', title: 'GitHub', url: 'https://github.com' },
      { category: '学习资源', title: '掘金', url: 'https://juejin.cn' },
    ]

    const [cats] = await pool.execute(
      'SELECT id, name FROM categories WHERE user_id = ?', [result.insertId]
    )
    const catMap = {}
    cats.forEach(c => { catMap[c.name] = c.id })

    for (const bm of defaultBookmarks) {
      if (catMap[bm.category]) {
        await pool.execute(
          'INSERT INTO bookmarks (category_id, user_id, title, url, icon) VALUES (?, ?, ?, ?, ?)',
          [catMap[bm.category], result.insertId, bm.title, bm.url, '']
        )
      }
    }

    const token = signToken(result.insertId, username)
    res.json({
      message: '注册成功',
      token,
      user: { id: result.insertId, username, nickname: nickname || username }
    })
  } catch (err) {
    console.error('注册失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' })
    }

    const [users] = await pool.execute('SELECT * FROM users WHERE username = ?', [username])
    if (users.length === 0) {
      return res.status(400).json({ error: '用户名或密码错误' })
    }

    const user = users[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(400).json({ error: '用户名或密码错误' })
    }

    const token = signToken(user.id, user.username)
    res.json({
      message: '登录成功',
      token,
      user: { id: user.id, username: user.username, nickname: user.nickname }
    })
  } catch (err) {
    console.error('登录失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 退出
router.post('/logout', (req, res) => {
  req.session.destroy()
  res.json({ message: '已退出' })
})

// 获取当前用户
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.execute(
      'SELECT id, username, nickname FROM users WHERE id = ?',
      [req.userId]
    )
    if (users.length > 0) {
      return res.json({ user: users[0] })
    }
    res.status(401).json({ error: '未登录' })
  } catch (err) {
    console.error('验证用户失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

module.exports = router
