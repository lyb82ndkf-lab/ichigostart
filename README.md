# 🍓 草莓起始页 (IchigoStart)

一个美观、可定制的浏览器起始页，支持多用户注册登录，自定义分类导航和书签管理。

## ✨ 功能特性

- 🔐 **用户系统** — 注册 / 登录，每个用户独立保存自己的数据
- 📂 **分类管理** — 自由创建、编辑、删除导航分类
- 🔖 **书签导航** — 添加网址，支持自定义标题、图标和描述
- 🖼️ **图标获取** — 自动获取网站 Favicon，也支持手动上传图标
- 🔍 **多引擎搜索** — 内置百度、Google、Bing、DuckDuckGo，一键切换
- ⏰ **实时时钟** — 显示时间、日期和个性化问候语
- 🎨 **主题定制** — 5 种主题色（草莓红 / 青柠绿 / 天空蓝 / 青色 / 紫罗兰）
- 🌗 **明暗模式** — 亮色 / 暗色主题自由切换
- 🖼️ **背景图片** — 内置 3 张精选壁纸，支持上传自定义背景
- 🪟 **毛玻璃 UI** — 现代化毛玻璃卡片效果 + 渐变动画背景
- 📱 **响应式布局** — 完美适配桌面端和移动端

## 🛠️ 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | Vue 3 + CSS3（毛玻璃 / CSS 动画 / CSS 变量主题系统） |
| 后端 | Node.js + Express |
| 数据库 | MySQL |
| 认证 | express-session + bcryptjs |

## 📦 项目结构

```
ichigostart/
├── server.js                 # Express 主入口
├── server/
│   ├── db.js                 # MySQL 连接配置
│   └── routes/
│       ├── auth.js           # 认证 API（注册 / 登录 / 退出）
│       ├── categories.js     # 分类 CRUD API
│       └── bookmarks.js      # 书签 CRUD API + 图标上传
├── src/                      # Vue 前端源码
│   ├── App.vue
│   ├── main.js
│   ├── api/index.js          # 接口封装
│   ├── views/
│   │   ├── LoginView.vue     # 登录 / 注册页
│   │   └── HomeView.vue      # 主起始页
│   ├── components/
│   │   ├── SearchBar.vue         # 搜索栏
│   │   ├── ClockGreeting.vue     # 时钟 + 问候语
│   │   ├── CategorySection.vue   # 分类区块
│   │   ├── BookmarkCard.vue      # 书签卡片
│   │   ├── AddBookmarkModal.vue  # 添加 / 编辑书签弹窗
│   │   ├── AddCategoryModal.vue  # 添加 / 编辑分类弹窗
│   │   └── SettingsPanel.vue     # 设置面板
│   └── assets/styles/global.css  # 全局样式 + 主题系统
├── public/
│   ├── logo.png             # 网站 Logo
│   └── static/background/   # 内置壁纸
├── dist/                     # Vue 编译产物
└── ecosystem.config.js       # PM2 部署配置
```

## 🚀 快速开始

### 环境要求

- Node.js >= 14
- MySQL >= 5.7

### 1. 安装依赖

```bash
npm install
```

### 2. 配置数据库

在 MySQL 中创建数据库和用户：

```sql
CREATE DATABASE ichigo DEFAULT CHARACTER SET utf8mb4;
CREATE USER 'ichigo'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON ichigo.* TO 'ichigo'@'localhost';
FLUSH PRIVILEGES;
```

> 表结构会在首次启动时自动创建。

### 3. 开发模式

```bash
npm run serve     # 启动 Vue 开发服务器 (port 8080)
node server.js    # 启动后端服务 (port 4006)
```

### 4. 生产构建

```bash
npm run build     # 编译 Vue 到 dist/
node server.js    # 启动完整服务
```

## 🐳 PM2 部署（推荐）

```bash
# 安装依赖
npm install --production

# 构建前端
npm run build

# 启动
pm2 start ecosystem.config.js
pm2 save
pm2 startup       # 设置开机自启
```

常用命令：

```bash
pm2 logs ichigostart     # 查看日志
pm2 restart ichigostart  # 重启
pm2 stop ichigostart     # 停止
pm2 delete ichigostart   # 删除进程
```

## 🔧 环境变量

可通过环境变量覆盖默认配置：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `PORT` | `4006` | 服务端口 |
| `DB_HOST` | `localhost` | 数据库地址 |
| `DB_PORT` | `3306` | 数据库端口 |
| `DB_USER` | `ichigo` | 数据库用户名 |
| `DB_PASS` | — | 数据库密码 |
| `DB_NAME` | `ichigo` | 数据库名 |

## 📝 License

MIT
