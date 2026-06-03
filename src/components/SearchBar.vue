<template>
  <div class="search-bar-wrapper">
    <div class="search-bar glass" :class="{ focused: isFocused }">
      <!-- 搜索引擎选择 -->
      <div class="engine-selector" @click="showEngines = !showEngines">
        <img
          :src="currentEngine.icon"
          :alt="currentEngine.name"
          class="engine-icon"
          @error="handleIconError"
        />
        <svg class="engine-arrow" :class="{ open: showEngines }" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>

      <!-- 搜索引擎下拉 -->
      <div class="engine-dropdown" v-if="showEngines">
        <div
          v-for="engine in engines"
          :key="engine.id"
          class="engine-option"
          :class="{ active: engine.id === currentEngineId }"
          @click="selectEngine(engine)"
        >
          <img :src="engine.icon" :alt="engine.name" class="engine-icon" @error="handleIconError" />
          <span>{{ engine.name }}</span>
        </div>
      </div>

      <!-- 输入框 -->
      <input
        ref="searchInput"
        class="search-input"
        type="text"
        v-model="query"
        :placeholder="currentEngine.placeholder"
        @focus="isFocused = true; showEngines = false"
        @blur="isFocused = false"
        @keydown.enter="doSearch"
      />

      <!-- 搜索按钮 -->
      <button class="search-btn" @click="doSearch" :disabled="!query.trim()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SearchBar',
  data() {
    return {
      query: '',
      isFocused: false,
      showEngines: false,
      currentEngineId: 'baidu',
      engines: [
        {
          id: 'baidu',
          name: '百度',
          url: 'https://www.baidu.com/s?wd=',
          icon: 'https://www.baidu.com/favicon.ico',
          placeholder: '百度一下...',
        },
        {
          id: 'google',
          name: 'Google',
          url: 'https://www.google.com/search?q=',
          icon: 'https://www.google.com/favicon.ico',
          placeholder: 'Google Search...',
        },
        {
          id: 'bing',
          name: 'Bing',
          url: 'https://www.bing.com/search?q=',
          icon: 'https://www.bing.com/favicon.ico',
          placeholder: '搜索 Bing...',
        },
        {
          id: 'duckduckgo',
          name: 'DuckDuckGo',
          url: 'https://duckduckgo.com/?q=',
          icon: 'https://duckduckgo.com/favicon.ico',
          placeholder: 'Search DuckDuckGo...',
        },
      ],
    }
  },
  computed: {
    currentEngine() {
      return this.engines.find(e => e.id === this.currentEngineId) || this.engines[0]
    },
  },
  mounted() {
    // 点击外部关闭下拉
    document.addEventListener('click', this.handleOutsideClick)
    this.$refs.searchInput?.focus()
  },
  beforeUnmount() {
    document.removeEventListener('click', this.handleOutsideClick)
  },
  methods: {
    doSearch() {
      if (!this.query.trim()) return
      const url = this.currentEngine.url + encodeURIComponent(this.query.trim())
      window.open(url, '_blank')
    },
    selectEngine(engine) {
      this.currentEngineId = engine.id
      this.showEngines = false
      this.$refs.searchInput?.focus()
    },
    handleOutsideClick(e) {
      if (!this.$el.contains(e.target)) {
        this.showEngines = false
      }
    },
    handleIconError(e) {
      // 用首字母作为后备
      e.target.style.display = 'none'
    },
  },
}
</script>

<style scoped>
.search-bar-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 40px;
  animation: slideUp 0.5s ease-out;
}

.search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 560px;
  height: 52px;
  border-radius: var(--radius-full);
  padding: 0 8px 0 4px;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
  position: relative;
}

.search-bar.focused {
  max-width: 640px;
  box-shadow: var(--shadow-lg), 0 0 0 2px var(--primary-light);
}

/* 搜索引擎选择器 */
.engine-selector {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: var(--radius-full);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.engine-selector:hover {
  background: var(--primary-light);
}

.engine-icon {
  width: 20px;
  height: 20px;
  border-radius: 4px;
  object-fit: contain;
}

.engine-arrow {
  color: var(--text-muted);
  transition: transform var(--transition-fast);
}

.engine-arrow.open {
  transform: rotate(180deg);
}

/* 搜索引擎下拉 */
.engine-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  left: 8px;
  min-width: 160px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  z-index: 200;
  overflow: hidden;
  animation: fadeIn 0.2s ease;
}

.engine-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background var(--transition-fast);
  font-size: 14px;
  color: var(--text-primary);
}

.engine-option:hover {
  background: var(--primary-light);
}

.engine-option.active {
  color: var(--primary);
  font-weight: 500;
}

/* 输入框 */
.search-input {
  flex: 1;
  height: 100%;
  border: none;
  background: transparent;
  font-size: 15px;
  color: var(--text-primary);
  outline: none;
  padding: 0 8px;
}

.search-input::placeholder {
  color: var(--text-muted);
}

/* 搜索按钮 */
.search-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.search-btn:hover:not(:disabled) {
  background: var(--primary-dark);
  transform: scale(1.05);
}

.search-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

@media (max-width: 600px) {
  .search-bar {
    height: 46px;
  }
  .search-btn {
    width: 36px;
    height: 36px;
  }
}
</style>
