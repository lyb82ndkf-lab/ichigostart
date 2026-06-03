<template>
  <Teleport to="body">
    <div class="settings-overlay" @click.self="$emit('close')">
      <div class="settings-panel glass" @click.stop>
        <div class="settings-header">
          <h3>设置</h3>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="settings-body">
          <!-- 主题模式 -->
          <div class="setting-section">
            <h4 class="setting-title">外观模式</h4>
            <div class="theme-toggle">
              <button
                :class="['toggle-option', { active: currentTheme === 'light' }]"
                @click="$emit('change-theme', 'light')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
                亮色
              </button>
              <button
                :class="['toggle-option', { active: currentTheme === 'dark' }]"
                @click="$emit('change-theme', 'dark')"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                暗色
              </button>
            </div>
          </div>

          <!-- 主题色 -->
          <div class="setting-section">
            <h4 class="setting-title">主题色</h4>
            <div class="color-options">
              <button
                v-for="color in colors"
                :key="color.id"
                :class="['color-btn', { active: currentColor === color.id }]"
                :style="{ '--c': color.value }"
                @click="$emit('change-color', color.id)"
                :title="color.name"
              >
                <svg v-if="currentColor === color.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </div>

          <!-- 背景图片 -->
          <div class="setting-section">
            <h4 class="setting-title">背景图片</h4>
            <div class="bg-options">
              <!-- 默认（无背景） -->
              <div
                :class="['bg-thumb', { active: !bgImage }]"
                @click="$emit('change-bg', '')"
              >
                <div class="bg-thumb-inner bg-default">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="3" x2="21" y2="21"/></svg>
                </div>
                <span class="bg-label">默认</span>
              </div>

              <!-- 内置背景 1 -->
              <div
                :class="['bg-thumb', { active: bgImage === bgList[0].src }]"
                @click="$emit('change-bg', bgList[0].src)"
              >
                <div class="bg-thumb-inner">
                  <img :src="bgList[0].src" :alt="bgList[0].name" />
                </div>
                <span class="bg-label">{{ bgList[0].name }}</span>
              </div>

              <!-- 内置背景 2 -->
              <div
                :class="['bg-thumb', { active: bgImage === bgList[1].src }]"
                @click="$emit('change-bg', bgList[1].src)"
              >
                <div class="bg-thumb-inner">
                  <img :src="bgList[1].src" :alt="bgList[1].name" />
                </div>
                <span class="bg-label">{{ bgList[1].name }}</span>
              </div>

              <!-- 内置背景 3 -->
              <div
                :class="['bg-thumb', { active: bgImage === bgList[2].src }]"
                @click="$emit('change-bg', bgList[2].src)"
              >
                <div class="bg-thumb-inner">
                  <img :src="bgList[2].src" :alt="bgList[2].name" />
                </div>
                <span class="bg-label">{{ bgList[2].name }}</span>
              </div>

              <!-- 自定义上传 -->
              <label :class="['bg-thumb', 'bg-upload', { active: isCustomBg }]">
                <div class="bg-thumb-inner bg-custom">
                  <svg v-if="!isCustomBg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <img v-else :src="bgImage" alt="自定义" />
                  <input type="file" accept="image/*" @change="handleCustomBg" hidden />
                </div>
                <span class="bg-label">{{ isCustomBg ? '已自定义' : '上传图片' }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'SettingsPanel',
  props: {
    currentTheme: { type: String, default: 'light' },
    currentColor: { type: String, default: 'rose' },
    bgImage: { type: String, default: '' },
  },
  emits: ['close', 'change-theme', 'change-color', 'change-bg'],
  data() {
    return {
      colors: [
        { id: 'rose', name: '草莓红', value: '#ff4b6e' },
        { id: 'green', name: '青柠绿', value: '#70c000' },
        { id: 'blue', name: '天空蓝', value: '#5ca1ff' },
        { id: 'cyan', name: '青色', value: '#4cb6c2' },
        { id: 'purple', name: '紫罗兰', value: '#bb8cdd' },
      ],
      bgList: [
        { name: '风景', src: '/static/background/background (1).jpg' },
        { name: '海边', src: '/static/background/background (2).jpg' },
        { name: '夜空', src: '/static/background/background (3).jpg' },
      ],
    }
  },
  computed: {
    isCustomBg() {
      return this.bgImage && !this.bgList.some(b => b.src === this.bgImage)
    },
  },
  methods: {
    handleCustomBg(e) {
      const file = e.target.files[0]
      if (!file) return
      // 本地预览，不上传服务器
      const reader = new FileReader()
      reader.onload = (ev) => {
        this.$emit('change-bg', ev.target.result)
      }
      reader.readAsDataURL(file)
    },
  },
}
</script>

<style scoped>
.settings-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

.settings-panel {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease-out;
}

.settings-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.settings-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-body {
  padding: 20px 24px 28px;
}

.setting-section {
  margin-bottom: 24px;
}

.setting-section:last-child {
  margin-bottom: 0;
}

.setting-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
}

/* 主题模式切换 */
.theme-toggle {
  display: flex;
  gap: 10px;
}

.toggle-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-card);
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 14px;
  transition: all var(--transition-fast);
}

.toggle-option:hover {
  border-color: var(--primary);
}

.toggle-option.active {
  border-color: var(--primary);
  background: var(--primary-light);
  color: var(--primary);
  font-weight: 500;
}

/* 颜色选择 */
.color-options {
  display: flex;
  gap: 12px;
}

.color-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 3px solid transparent;
  background: var(--c);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
}

.color-btn:hover {
  transform: scale(1.15);
}

.color-btn.active {
  border-color: var(--text-primary);
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--c);
}

/* 背景图片选择 */
.bg-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.bg-thumb {
  cursor: pointer;
  text-align: center;
}

.bg-thumb-inner {
  width: 100%;
  aspect-ratio: 16 / 10;
  border-radius: var(--radius-sm);
  border: 2.5px solid transparent;
  overflow: hidden;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  color: var(--text-muted);
}

.bg-thumb-inner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-thumb:hover .bg-thumb-inner {
  border-color: var(--primary);
  transform: scale(1.03);
}

.bg-thumb.active .bg-thumb-inner {
  border-color: var(--primary);
  box-shadow: 0 0 0 2px var(--primary-light);
}

.bg-default {
  background: linear-gradient(135deg, #f0f2f5, #e0e2e5);
}

.bg-custom {
  background: var(--bg-card);
  border-style: dashed;
  border-color: var(--border-color);
}

.bg-thumb.bg-upload:hover .bg-thumb-inner,
.bg-thumb.bg-upload.active .bg-thumb-inner {
  border-color: var(--primary);
}

.bg-label {
  display: block;
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}
</style>
