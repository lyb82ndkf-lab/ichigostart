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
      @logout="onLogout"
      @change-theme="onChangeTheme"
      @change-color="onChangeColor"
      @change-bg="onChangeBg"
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
