const express = require('express')
const multer = require('multer')
const path = require('path')
const { pool } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 文件上传配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads'))
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    cb(null, `icon_${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`)
  }
})
const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /\.(jpg|jpeg|png|gif|svg|webp|ico)$/i
    if (allowed.test(path.extname(file.originalname))) {
      cb(null, true)
    } else {
      cb(new Error('只支持图片文件'))
    }
  }
})

// 所有路由都需要认证
router.use(authMiddleware)

// 获取书签
router.get('/', async (req, res) => {
  try {
    const { category_id } = req.query
    let sql = 'SELECT * FROM bookmarks WHERE user_id = ?'
    const params = [req.userId]

    if (category_id) {
      sql += ' AND category_id = ?'
      params.push(category_id)
    }
    sql += ' ORDER BY sort_order ASC, id ASC'

    const [bookmarks] = await pool.execute(sql, params)
    res.json({ bookmarks })
  } catch (err) {
    console.error('获取书签失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 创建书签
router.post('/', async (req, res) => {
  try {
    const { category_id, title, url, icon, description, sort_order } = req.body
    if (!category_id || !title || !url) {
      return res.status(400).json({ error: '分类、标题和网址不能为空' })
    }

    const [cat] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [category_id, req.userId]
    )
    if (cat.length === 0) {
      return res.status(400).json({ error: '分类不存在' })
    }

    const [result] = await pool.execute(
      'INSERT INTO bookmarks (category_id, user_id, title, url, icon, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [category_id, req.userId, title, url, icon || '', description || '', sort_order || 0]
    )

    res.json({
      message: '添加成功',
      bookmark: {
        id: result.insertId, category_id, title, url,
        icon: icon || '', description: description || '',
        sort_order: sort_order || 0, user_id: req.userId
      }
    })
  } catch (err) {
    console.error('创建书签失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 更新书签
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, url, icon, description, sort_order, category_id } = req.body

    const [existing] = await pool.execute(
      'SELECT id FROM bookmarks WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    if (existing.length === 0) {
      return res.status(404).json({ error: '书签不存在' })
    }

    const updates = []
    const values = []
    if (title !== undefined) { updates.push('title = ?'); values.push(title) }
    if (url !== undefined) { updates.push('url = ?'); values.push(url) }
    if (icon !== undefined) { updates.push('icon = ?'); values.push(icon) }
    if (description !== undefined) { updates.push('description = ?'); values.push(description) }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }
    if (category_id !== undefined) { updates.push('category_id = ?'); values.push(category_id) }

    if (updates.length > 0) {
      values.push(id, req.userId)
      await pool.execute(
        `UPDATE bookmarks SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      )
    }

    res.json({ message: '更新成功' })
  } catch (err) {
    console.error('更新书签失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 删除书签
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.execute(
      'DELETE FROM bookmarks WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '书签不存在' })
    }
    res.json({ message: '删除成功' })
  } catch (err) {
    console.error('删除书签失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 上传图标
router.post('/upload', upload.single('icon'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' })
  }
  res.json({
    message: '上传成功',
    url: `/uploads/${req.file.filename}`
  })
})

module.exports = router
