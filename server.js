const express = require('express')
const session = require('express-session')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

// 手动加载 .env 文件（无需 dotenv 依赖）
const envPath = path.join(__dirname, '.env')
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf-8').split('\n').forEach(line => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const idx = trimmed.indexOf('=')
    if (idx > 0) {
      const key = trimmed.slice(0, idx).trim()
      const val = trimmed.slice(idx + 1).trim()
      if (!process.env[key]) process.env[key] = val
    }
  })
}

const { initDatabase } = require('./server/db')
const authRoutes = require('./server/routes/auth')
const categoryRoutes = require('./server/routes/categories')
const bookmarkRoutes = require('./server/routes/bookmarks')

const app = express()
const PORT = process.env.PORT || 4006

app.use(cors({
  origin: true,
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(session({
  secret: process.env.SESSION_SECRET || 'change-me-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: false,
  }
}))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use(express.static(path.join(__dirname, 'dist')))

app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  }
})

async function start() {
  const MAX_RETRIES = 5
  const RETRY_DELAY = 5000

  for (let i = 1; i <= MAX_RETRIES; i++) {
    try {
      await initDatabase()
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`🍓 草莓起始页服务已启动: http://0.0.0.0:${PORT}`)
      })
      return
    } catch (err) {
      console.error(`❌ 数据库连接失败 (第${i}/${MAX_RETRIES}次): ${err.message}`)
      if (i < MAX_RETRIES) {
        console.log(`⏳ ${RETRY_DELAY / 1000}秒后重试...`)
        await new Promise(r => setTimeout(r, RETRY_DELAY))
      }
    }
  }

  console.error('❌ 重试次数已用尽，启动失败')
  process.exit(1)
}

start()
