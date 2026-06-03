<template>
  <div class="login-page">
    <div class="login-card glass">
      <div class="login-header">
        <div class="logo">🍓</div>
        <h1 class="login-title">草莓起始页</h1>
        <p class="login-subtitle">你的专属浏览器导航</p>
      </div>

      <div class="login-tabs">
        <button
          :class="['tab-btn', { active: mode === 'login' }]"
          @click="mode = 'login'"
        >登录</button>
        <button
          :class="['tab-btn', { active: mode === 'register' }]"
          @click="mode = 'register'"
        >注册</button>
        <div class="tab-indicator" :style="{ transform: mode === 'register' ? 'translateX(100%)' : 'translateX(0)' }"></div>
      </div>

      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group" v-if="mode === 'register'">
          <label>昵称</label>
          <input
            class="input"
            type="text"
            v-model="form.nickname"
            placeholder="给自己取个好听的名字"
            maxlength="20"
          />
        </div>
        <div class="form-group">
          <label>用户名</label>
          <input
            class="input"
            type="text"
            v-model="form.username"
            placeholder="3-20 个字符"
            maxlength="20"
            autocomplete="username"
          />
        </div>
        <div class="form-group">
          <label>密码</label>
          <input
            class="input"
            type="password"
            v-model="form.password"
            placeholder="至少 6 个字符"
            maxlength="30"
            autocomplete="current-password"
          />
        </div>
        <div class="form-group" v-if="mode === 'register'">
          <label>确认密码</label>
          <input
            class="input"
            type="password"
            v-model="form.confirmPassword"
            placeholder="再输入一次密码"
            maxlength="30"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <button class="btn btn-primary login-btn" type="submit" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? '请稍候...' : (mode === 'login' ? '登 录' : '注 册') }}
        </button>
      </form>
    </div>
  </div>
</template>

<script>
import { auth } from '../api'

export default {
  name: 'LoginView',
  emits: ['login'],
  data() {
    return {
      mode: 'login',
      form: {
        username: '',
        password: '',
        confirmPassword: '',
        nickname: '',
      },
      error: '',
      loading: false,
    }
  },
  methods: {
    async handleSubmit() {
      this.error = ''
      const { username, password, confirmPassword, nickname } = this.form

      if (!username.trim()) {
        this.error = '请输入用户名'
        return
      }
      if (!password) {
        this.error = '请输入密码'
        return
      }

      if (this.mode === 'register') {
        if (password.length < 6) {
          this.error = '密码长度至少 6 个字符'
          return
        }
        if (password !== confirmPassword) {
          this.error = '两次输入的密码不一致'
          return
        }
      }

      this.loading = true
      try {
        let data
        if (this.mode === 'login') {
          data = await auth.login(username.trim(), password)
        } else {
          data = await auth.register(username.trim(), password, nickname.trim() || username.trim())
        }
        this.$emit('login', data.user)
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 400px;
  padding: 40px 36px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.5s ease-out;
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  font-size: 56px;
  margin-bottom: 12px;
  animation: bounce 0.8s ease-out;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  40% { transform: translateY(-16px); }
  60% { transform: translateY(-8px); }
}

.login-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--text-muted);
}

.login-tabs {
  display: flex;
  position: relative;
  background: var(--bg-card);
  border-radius: var(--radius-full);
  padding: 4px;
  margin-bottom: 28px;
  border: 1px solid var(--border-color);
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
  position: relative;
  z-index: 1;
}

.tab-btn.active {
  color: #fff;
}

.tab-indicator {
  position: absolute;
  top: 4px;
  left: 4px;
  width: calc(50% - 4px);
  height: calc(100% - 8px);
  background: var(--primary);
  border-radius: var(--radius-full);
  transition: transform var(--transition-normal);
  z-index: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
}

.error-msg {
  padding: 10px 14px;
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border-radius: var(--radius-sm);
  font-size: 13px;
  animation: fadeIn 0.3s ease;
}

.login-btn {
  width: 100%;
  padding: 12px;
  font-size: 15px;
  margin-top: 4px;
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
