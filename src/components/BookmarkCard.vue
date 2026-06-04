<template>
  <a
    class="bookmark-card"
    :href="bookmark.url"
    target="_blank"
    rel="noopener noreferrer"
    @contextmenu.prevent="openMenu"
  >
    <div class="card-icon">
      <img
        v-if="bookmark.icon"
        :src="bookmark.icon"
        :alt="bookmark.title"
        class="icon-img"
        @error="iconError = true"
      />
      <div v-if="!bookmark.icon || iconError" class="icon-fallback" :style="{ background: bgColor }">
        {{ bookmark.title.charAt(0).toUpperCase() }}
      </div>
    </div>
    <div class="card-title" :title="bookmark.title">{{ bookmark.title }}</div>

    <!-- 右键菜单 -->
    <Teleport to="body">
      <div
        v-if="showMenu"
        class="context-menu-overlay"
        @click="closeMenu"
        @contextmenu.prevent="closeMenu"
      >
        <div
          class="context-menu glass"
          :style="menuStyle"
          @click.stop
        >
          <div class="menu-item" @click="handleEdit">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            编辑
          </div>
          <div class="menu-item danger" @click="handleDelete">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            删除
          </div>
        </div>
      </div>
    </Teleport>
  </a>
</template>

<script>
export default {
  name: 'BookmarkCard',
  props: {
    bookmark: { type: Object, required: true },
  },
  emits: ['edit', 'delete'],
  data() {
    return {
      showMenu: false,
      iconError: false,
      menuX: 0,
      menuY: 0,
    }
  },
  computed: {
    bgColor() {
      const colors = [
        '#ff4b6e', '#5ca1ff', '#70c000', '#bb8cdd',
        '#4cb6c2', '#ff8c42', '#ff6b9d', '#45b7d1',
        '#96ceb4', '#ffeaa7', '#a29bfe', '#fd79a8',
      ]
      let hash = 0
      for (let i = 0; i < this.bookmark.title.length; i++) {
        hash = this.bookmark.title.charCodeAt(i) + ((hash << 5) - hash)
      }
      return colors[Math.abs(hash) % colors.length]
    },
    menuStyle() {
      // 确保菜单不超出屏幕
      const menuW = 140
      const menuH = 80
      let x = this.menuX
      let y = this.menuY
      if (x + menuW > window.innerWidth) x = window.innerWidth - menuW - 8
      if (y + menuH > window.innerHeight) y = window.innerHeight - menuH - 8
      return { left: x + 'px', top: y + 'px' }
    },
  },
  methods: {
    openMenu(e) {
      this.menuX = e.clientX
      this.menuY = e.clientY
      this.showMenu = true
    },
    closeMenu() {
      this.showMenu = false
    },
    handleEdit(e) {
      e.preventDefault()
      this.showMenu = false
      this.$emit('edit')
    },
    handleDelete(e) {
      e.preventDefault()
      this.showMenu = false
      this.$emit('delete')
    },
  },
}
</script>

<style scoped>
.bookmark-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 8px 12px;
  border-radius: var(--radius-md);
  text-decoration: none;
  color: var(--text-primary);
  transition: all var(--transition-fast);
  cursor: pointer;
  position: relative;
}

.bookmark-card:hover {
  background: var(--bg-card-hover);
  transform: translateY(-3px);
  box-shadow: var(--shadow-card-hover);
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-card);
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
}

.bookmark-card:hover .card-icon {
  transform: scale(1.08);
  box-shadow: var(--shadow-md);
}

.icon-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.icon-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 20px;
  font-weight: 600;
}

.card-title {
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  line-height: 1.3;
}

/* 右键菜单 */
.context-menu-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
}

.context-menu {
  position: fixed;
  z-index: 10000;
  min-width: 120px;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  animation: scaleIn 0.15s ease-out;
  padding: 4px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  font-size: 13px;
  cursor: pointer;
  border-radius: 6px;
  transition: background var(--transition-fast);
  color: var(--text-primary);
}

.menu-item:hover {
  background: var(--primary-light);
  color: var(--primary);
}

.menu-item.danger:hover {
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
}
</style>
