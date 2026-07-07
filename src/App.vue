<template>
  <div class="app-root" :data-theme="theme" :data-color="themeColor">
    <div :class="['animated-bg', { 'has-bg': bgImage }]" :style="bgStyle"></div>
    <div v-if="!bgImage" class="floating-orb"></div>
    <div v-if="!bgImage" class="floating-orb"></div>
    <div v-if="!bgImage" class="floating-orb"></div>

    <LoginView
      v-if="!user"
      @login="onLogin"
    />
    <HomeView
      v-else
      :user="user"
      :theme="theme"
      :themeColor="themeColor"
      :bgImage="bgImage"
      :widgetsCollapsedSetting="widgetsCollapsedSetting"
      :widgetsScale="widgetsScale"
      :widgetsWidth="widgetsWidth"
      @logout="onLogout"
      @change-theme="onChangeTheme"
      @change-color="onChangeColor"
      @change-bg="onChangeBg"
      @change-widgets-collapsed="onChangeWidgetsCollapsed"
      @change-widgets-scale="onChangeWidgetsScale"
      @change-widgets-width="onChangeWidgetsWidth"
    />
  </div>
</template>

<script>
import { auth } from './api'
import LoginView from './views/LoginView.vue'
import HomeView from './views/HomeView.vue'

export default {
  name: 'App',
  components: { LoginView, HomeView },
  data() {
    return {
      user: null,
      theme: localStorage.getItem('theme') || 'light',
      themeColor: localStorage.getItem('themeColor') || 'rose',
      bgImage: localStorage.getItem('bgImage') || '',
      widgetsCollapsedSetting: localStorage.getItem('widgetsCollapsedSetting') === 'true',
      widgetsScale: parseInt(localStorage.getItem('widgetsScale')) || 100,
      widgetsWidth: parseInt(localStorage.getItem('widgetsWidth')) || 290,
    }
  },
  computed: {
    bgStyle() {
      if (this.bgImage) {
        return {
          backgroundImage: `url(${this.bgImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }
      }
      return {}
    },
  },
  async mounted() {
    this.applyTheme()
    this.applyWidgetsSettings()
    try {
      const data = await auth.me()
      this.user = data.user
    } catch {
      this.user = null
    }
  },
  methods: {
    onLogin(user) {
      this.user = user
    },
    async onLogout() {
      await auth.logout()
      this.user = null
    },
    onChangeTheme(t) {
      this.theme = t
      localStorage.setItem('theme', t)
      this.applyTheme()
    },
    onChangeColor(c) {
      this.themeColor = c
      localStorage.setItem('themeColor', c)
      this.applyTheme()
    },
    onChangeBg(img) {
      this.bgImage = img
      if (img) {
        localStorage.setItem('bgImage', img)
      } else {
        localStorage.removeItem('bgImage')
      }
    },
    applyTheme() {
      document.documentElement.setAttribute('data-theme', this.theme)
      document.documentElement.setAttribute('data-color', this.themeColor)
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    },
    onChangeWidgetsCollapsed(c) {
      this.widgetsCollapsedSetting = c
      localStorage.setItem('widgetsCollapsedSetting', c)
    },
    onChangeWidgetsScale(s) {
      this.widgetsScale = s
      localStorage.setItem('widgetsScale', s)
      this.applyWidgetsSettings()
    },
    onChangeWidgetsWidth(w) {
      this.widgetsWidth = w
      localStorage.setItem('widgetsWidth', w)
      this.applyWidgetsSettings()
    },
    applyWidgetsSettings() {
      document.documentElement.style.setProperty('--widget-scale', this.widgetsScale / 100)
      document.documentElement.style.setProperty('--widget-width', this.widgetsWidth + 'px')
    },
  },
}
</script>

<style>
.app-root {
  width: 100%;
  min-height: 100vh;
}
</style>
