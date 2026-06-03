const express = require('express')
const { pool } = require('../db')

const router = express.Router()

// 获取当前用户的所有分类
router.get('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    const [categories] = await pool.execute(
      'SELECT * FROM categories WHERE user_id = ? ORDER BY sort_order ASC, id ASC',
      [req.session.userId]
    )
    res.json({ categories })
  } catch (err) {
    console.error('获取分类失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 创建分类
router.post('/', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    const { name, sort_order } = req.body
    if (!name) {
      return res.status(400).json({ error: '分类名不能为空' })
    }

    const [result] = await pool.execute(
      'INSERT INTO categories (user_id, name, sort_order) VALUES (?, ?, ?)',
      [req.session.userId, name, sort_order || 0]
    )

    res.json({
      message: '创建成功',
      category: { id: result.insertId, name, sort_order: sort_order || 0, user_id: req.session.userId }
    })
  } catch (err) {
    console.error('创建分类失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 更新分类
router.put('/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    const { id } = req.params
    const { name, sort_order } = req.body

    // 验证归属
    const [existing] = await pool.execute(
      'SELECT id FROM categories WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    )
    if (existing.length === 0) {
      return res.status(404).json({ error: '分类不存在' })
    }

    const updates = []
    const values = []
    if (name !== undefined) { updates.push('name = ?'); values.push(name) }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }

    if (updates.length > 0) {
      values.push(id, req.session.userId)
      await pool.execute(
        `UPDATE categories SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      )
    }

    res.json({ message: '更新成功' })
  } catch (err) {
    console.error('更新分类失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 删除分类
router.delete('/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: '未登录' })
  }
  try {
    const { id } = req.params
    const [result] = await pool.execute(
      'DELETE FROM categories WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '分类不存在' })
    }
    res.json({ message: '删除成功' })
  } catch (err) {
    console.error('删除分类失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

module.exports = router
