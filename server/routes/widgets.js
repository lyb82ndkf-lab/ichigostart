const express = require('express')
const { pool } = require('../db')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()

// 所有挂件接口均需要认证
router.use(authMiddleware)

// 1. 获取当前用户的所有挂件
router.get('/', async (req, res) => {
  try {
    const [widgets] = await pool.execute(
      'SELECT * FROM widgets WHERE user_id = ? ORDER BY sort_order ASC, id ASC',
      [req.userId]
    )
    res.json({ widgets })
  } catch (err) {
    console.error('获取挂件失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 2. 创建挂件
router.post('/', async (req, res) => {
  try {
    const { type, title, content, position, sort_order } = req.body
    if (!type) {
      return res.status(400).json({ error: '挂件类型不能为空' })
    }

    const [result] = await pool.execute(
      'INSERT INTO widgets (user_id, type, title, content, position, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
      [req.userId, type, title || '', content || '', position || 'right', sort_order || 0]
    )

    res.json({
      message: '创建成功',
      widget: {
        id: result.insertId,
        user_id: req.userId,
        type,
        title: title || '',
        content: content || '',
        position: position || 'right',
        sort_order: sort_order || 0
      }
    })
  } catch (err) {
    console.error('创建挂件失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 3. 更新挂件
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { title, content, position, sort_order } = req.body

    // 检查挂件是否存在且属于当前用户
    const [existing] = await pool.execute(
      'SELECT id FROM widgets WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    if (existing.length === 0) {
      return res.status(404).json({ error: '挂件不存在' })
    }

    const updates = []
    const values = []
    if (title !== undefined) { updates.push('title = ?'); values.push(title) }
    if (content !== undefined) { updates.push('content = ?'); values.push(content) }
    if (position !== undefined) { updates.push('position = ?'); values.push(position) }
    if (sort_order !== undefined) { updates.push('sort_order = ?'); values.push(sort_order) }

    if (updates.length > 0) {
      values.push(id, req.userId)
      await pool.execute(
        `UPDATE widgets SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        values
      )
    }

    res.json({ message: '更新成功' })
  } catch (err) {
    console.error('更新挂件失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

// 4. 删除挂件
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const [result] = await pool.execute(
      'DELETE FROM widgets WHERE id = ? AND user_id = ?',
      [id, req.userId]
    )
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: '挂件不存在' })
    }
    res.json({ message: '删除成功' })
  } catch (err) {
    console.error('删除挂件失败:', err)
    res.status(500).json({ error: '服务器错误' })
  }
})

module.exports = router
