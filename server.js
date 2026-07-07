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
const widgetRoutes = require('./server/routes/widgets')

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

// 服务端获取网站图标（放在路由前面，避免被 /:id 匹配）
app.get('/api/bookmarks/fetch-icon', async (req, res) => {
  const { url } = req.query
  if (!url) return res.status(400).json({ error: '缺少 url 参数' })

  try {
    let targetUrl = url
    if (!/^https?:\/\//i.test(targetUrl)) targetUrl = 'https://' + targetUrl
    const { hostname, origin } = new URL(targetUrl)

    const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    const FAST = 3000   // 快速源超时
    const SLOW = 5000   // 慢速源超时
    const TOTAL = 8000  // 总超时

    const fetchBuf = async (src, timeout) => {
      try {
        const resp = await fetch(src, {
          signal: AbortSignal.timeout(timeout),
          headers: { 'User-Agent': UA },
          redirect: 'follow',
        })
        if (!resp.ok) return null
        const ab = await resp.arrayBuffer()
        if (ab.byteLength < 100) return null
        return Buffer.from(ab)
      } catch { return null }
    }

    // 分两波：快速源（3s）先上，慢速源（5s）补位
    // 优先返回 PNG 格式的源，ICO 在 img 标签中无法显示
    const fastSources = [
      fetchBuf(`https://favicon.im/${hostname}`, FAST),        // PNG
      fetchBuf(`https://icon.horse/icon/${hostname}`, FAST),   // PNG
      fetchBuf(`https://icons.duckduckgo.com/ip3/${hostname}.ico`, FAST), // ICO
    ]

    const slowSources = [
      fetchBuf(`https://www.google.com/s2/favicons?domain=${hostname}&sz=64`, SLOW), // PNG
      fetchBuf(`https://favicons.githubusercontent.com/${hostname}`, SLOW), // PNG
      fetchBuf(`https://${hostname}/favicon.ico`, SLOW),  // ICO，放最后
    ]

    // HTML 解析 link[rel=icon]
    const htmlTask = (async () => {
      try {
        const resp = await fetch(targetUrl, {
          signal: AbortSignal.timeout(FAST),
          headers: { 'User-Agent': UA },
          redirect: 'follow',
        })
        if (!resp.ok) return null
        const html = await resp.text()
        const m = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
          || html.match(/<link[^>]*href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i)
        if (!m || !m[1]) return null
        let iconUrl = m[1]
        if (iconUrl.startsWith('//')) iconUrl = 'https:' + iconUrl
        else if (iconUrl.startsWith('/')) iconUrl = origin + iconUrl
        else if (!iconUrl.startsWith('http')) iconUrl = origin + '/' + iconUrl
        return await fetchBuf(iconUrl, FAST)
      } catch { return null }
    })()

    // 只关心非 null 的第一个结果，优先非 ICO 格式
    const isIco = (buf) => buf && buf.length > 4 && buf.slice(0, 4).toString('hex') === '00000100'
    const firstValid = (promises) => new Promise((resolve) => {
      let remaining = promises.length
      let icoFallback = null
      let resolved = false
      for (const p of promises) {
        p.then(val => {
          if (!val || resolved) return
          if (isIco(val)) {
            if (!icoFallback) icoFallback = val
          } else {
            resolved = true; resolve(val)
          }
        }).catch(() => {}).finally(() => {
          remaining--
          if (remaining === 0 && !resolved) {
            resolved = true; resolve(icoFallback)
          }
        })
      }
    })

    const findIcon = async () => {
      // 第一波：快速源 + HTML（3秒）
      const fast = await Promise.race([
        firstValid([...fastSources, htmlTask]),
        new Promise(r => setTimeout(() => r(null), FAST + 500))
      ])
      if (fast) return fast

      // 第二波：慢速源（5秒）
      const slow = await Promise.race([
        firstValid(slowSources),
        new Promise(r => setTimeout(() => r(null), SLOW + 500))
      ])
      return slow
    }

    const buffer = await Promise.race([
      findIcon(),
      new Promise(r => setTimeout(() => r(null), TOTAL))
    ])

    if (!buffer || buffer.length < 100) {
      return res.status(404).json({ error: '无法获取图标' })
    }

    const uploadsDir = path.join(__dirname, 'uploads')
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })

    // 根据文件头判断真实格式
    let ext = 'png'
    const head = buffer.slice(0, 16).toString('hex')
    if (head.startsWith('00000100')) ext = 'ico'           // ICO
    else if (head.startsWith('89504e47')) ext = 'png'      // PNG
    else if (head.startsWith('ffd8ff')) ext = 'jpg'        // JPEG
    else if (head.startsWith('47494638')) ext = 'gif'      // GIF
    else if (head.startsWith('52494646')) ext = 'webp'     // WebP (RIFF)
    else if (buffer.slice(0, 200).toString().includes('<svg')) ext = 'svg' // SVG
    else ext = 'ico'  // favicon 默认按 ICO 处理

    const filename = `favicon_${hostname}_${Date.now()}.${ext}`
    fs.writeFileSync(path.join(uploadsDir, filename), buffer)

    res.json({ url: `/uploads/${filename}` })
  } catch (err) {
    console.error('获取图标失败:', err.message)
    res.status(500).json({ error: '获取图标失败' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/bookmarks', bookmarkRoutes)
app.use('/api/widgets', widgetRoutes)
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
