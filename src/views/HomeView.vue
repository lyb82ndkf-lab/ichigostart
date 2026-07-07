<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <nav class="top-nav glass">
      <div class="nav-left">
        <img src="/logo.png" alt="logo" class="nav-logo-img" />
        <span class="nav-title">草莓起始页</span>
      </div>
      <div class="nav-right">
        <button class="btn btn-ghost" @click="showSettings = true">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          设置
        </button>
        <div class="user-menu">
          <div class="user-avatar">{{ userInitial }}</div>
          <span class="user-name">{{ user.nickname || user.username }}</span>
          <button class="btn btn-ghost btn-sm" @click="$emit('logout')">退出</button>
        </div>
      </div>
    </nav>

    <!-- 主体内容 -->
    <main class="main-content">
      <!-- 时钟问候 -->
      <ClockGreeting
        :nickname="user.nickname || user.username"
        :expanded="showBookmarks"
        @click-clock="toggleBookmarks"
        :style="!showBookmarks ? { marginTop: '15vh' } : {}"
      />

      <!-- 搜索栏 -->
      <SearchBar />

      <!-- 挂件区域 (在折叠导航时展示，展开时隐藏) -->
      <WidgetsArea
        v-if="!showBookmarks"
        :collapsed-setting="widgetsCollapsedSetting"
        :scale-setting="widgetsScale"
        :width-setting="widgetsWidth"
      />

      <!-- 分类和书签 - 带过渡动画 -->
      <div class="bookmarks-wrapper" :class="{ show: showBookmarks }">
        <div class="bookmarks-section">
          <div class="section-header">
            <h2 class="section-title">我的导航</h2>
            <button class="btn btn-primary btn-sm" @click="showAddCategory = true">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              添加分类
            </button>
          </div>

        <CategorySection
          v-for="cat in categories"
          :key="cat.id"
          :category="cat"
          :bookmarks="getBookmarksByCategory(cat.id)"
          @add-bookmark="openAddBookmark(cat.id)"
          @edit-bookmark="openEditBookmark"
          @delete-bookmark="deleteBookmark"
          @edit-category="openEditCategory"
          @delete-category="deleteCategory"
        />

        <div v-if="categories.length === 0 && !loading" class="empty-state fade-in">
          <div class="empty-icon">📂</div>
          <p>还没有分类，点击上方按钮创建第一个吧！</p>
        </div>
        </div>
      </div>
    </main>

    <!-- 添加分类弹窗 -->
    <AddCategoryModal
      v-if="showAddCategory"
      :editing-category="editingCategory"
      @close="showAddCategory = false; editingCategory = null"
      @save="saveCategory"
    />

    <!-- 添加书签弹窗 -->
    <AddBookmarkModal
      v-if="showAddBookmark"
      :category-id="addingBookmarkCategoryId"
      :categories="categories"
      :editing-bookmark="editingBookmark"
      @close="showAddBookmark = false; editingBookmark = null"
      @save="saveBookmark"
    />

    <!-- 设置面板 -->
    <SettingsPanel
      v-if="showSettings"
      :current-theme="$attrs.theme || theme"
      :current-color="$attrs.themeColor || themeColor"
      :bg-image="bgImage"
      :widgets-collapsed-setting="widgetsCollapsedSetting"
      :widgets-scale="widgetsScale"
      :widgets-width="widgetsWidth"
      @close="showSettings = false"
      @change-theme="$emit('change-theme', $event)"
      @change-color="$emit('change-color', $event)"
      @change-bg="$emit('change-bg', $event)"
      @change-widgets-collapsed="$emit('change-widgets-collapsed', $event)"
      @change-widgets-scale="$emit('change-widgets-scale', $event)"
      @change-widgets-width="$emit('change-widgets-width', $event)"
    />
  </div>
</template>

<script>
import { categories as catApi, bookmarks as bmApi } from '../api'
import ClockGreeting from '../components/ClockGreeting.vue'
import SearchBar from '../components/SearchBar.vue'
import CategorySection from '../components/CategorySection.vue'
import AddCategoryModal from '../components/AddCategoryModal.vue'
import AddBookmarkModal from '../components/AddBookmarkModal.vue'
import SettingsPanel from '../components/SettingsPanel.vue'
import WidgetsArea from '../components/WidgetsArea.vue'

export default {
  name: 'HomeView',
  components: { ClockGreeting, SearchBar, CategorySection, AddCategoryModal, AddBookmarkModal, SettingsPanel, WidgetsArea },
  props: ['user', 'theme', 'themeColor', 'bgImage', 'widgetsCollapsedSetting', 'widgetsScale', 'widgetsWidth'],
  emits: ['logout', 'change-theme', 'change-color', 'change-bg', 'change-widgets-collapsed', 'change-widgets-scale', 'change-widgets-width'],
  data() {
    return {
      categories: [],
      allBookmarks: [],
      loading: true,
      showAddCategory: false,
      showAddBookmark: false,
      showSettings: false,
      showBookmarks: false,
      addingBookmarkCategoryId: null,
      editingCategory: null,
      editingBookmark: null,
    }
  },
  computed: {
    userInitial() {
      const name = this.user.nickname || this.user.username
      return name.charAt(0).toUpperCase()
    },
  },
  watch: {
    showBookmarks(val) {
      document.body.style.overflow = val ? '' : 'hidden'
    },
  },
  async mounted() {
    await this.loadData()
    document.body.style.overflow = 'hidden'
  },
  beforeUnmount() {
    document.body.style.overflow = ''
  },
  methods: {
    toggleBookmarks() {
      this.showBookmarks = !this.showBookmarks
    },

    async loadData() {
      this.loading = true
      try {
        const [catData, bmData] = await Promise.all([
          catApi.list(),
          bmApi.list(),
        ])
        this.categories = catData.categories
        this.allBookmarks = bmData.bookmarks
      } catch (err) {
        console.error('加载数据失败:', err)
      } finally {
        this.loading = false
      }
    },

    getBookmarksByCategory(categoryId) {
      return this.allBookmarks.filter(b => b.category_id === categoryId)
    },

    openAddBookmark(categoryId) {
      this.addingBookmarkCategoryId = categoryId
      this.editingBookmark = null
      this.showAddBookmark = true
    },

    openEditBookmark(bookmark) {
      this.editingBookmark = bookmark
      this.addingBookmarkCategoryId = bookmark.category_id
      this.showAddBookmark = true
    },

    openEditCategory(category) {
      this.editingCategory = category
      this.showAddCategory = true
    },

    async saveCategory(data) {
      try {
        if (data.id) {
          await catApi.update(data.id, { name: data.name })
        } else {
          await catApi.create(data.name, this.categories.length)
        }
        await this.loadData()
        this.showAddCategory = false
        this.editingCategory = null
      } catch (err) {
        alert(err.message)
      }
    },

    async saveBookmark(data) {
      try {
        if (data.id) {
          await bmApi.update(data.id, data)
        } else {
          await bmApi.create({
            ...data,
            sort_order: this.allBookmarks.filter(b => b.category_id === data.category_id).length,
          })
        }
        await this.loadData()
        this.showAddBookmark = false
        this.editingBookmark = null
      } catch (err) {
        alert(err.message)
      }
    },

    async deleteBookmark(id) {
      if (!confirm('确定删除这个书签？')) return
      try {
        await bmApi.remove(id)
        await this.loadData()
      } catch (err) {
        alert(err.message)
      }
    },

    async deleteCategory(id) {
      if (!confirm('确定删除此分类？分类下的所有书签也会被删除。')) return
      try {
        await catApi.remove(id)
        await this.loadData()
      } catch (err) {
        alert(err.message)
      }
    },
  },
}
</script>

<style scoped>
.home-page {
  min-height: 100vh;
  padding-bottom: 60px;
}

/* 顶部导航 */
.top-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  border-radius: 0;
  border: none;
  border-bottom: 1px solid var(--border-color);
  z-index: 100;
}

.nav-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-logo {
  font-size: 24px;
}

.nav-logo-img {
  height: 32px;
  width: 32px;
  object-fit: contain;
  border-radius: 6px;
}

.nav-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.nav-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 12px;
  border-left: 1px solid var(--border-color);
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
}

.user-name {
  font-size: 14px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 主体 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 24px 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  transition: justify-content 0.4s ease;
}

.main-content .clock-greeting,
.main-content .search-bar-wrapper {
  width: 100%;
  max-width: 640px;
}

/* 导航展开/收起动画 */
.bookmarks-wrapper {
  width: 100%;
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transform: translateY(30px);
  transition:
    max-height 0.6s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.5s ease,
    transform 0.5s ease;
}

.bookmarks-wrapper.show {
  max-height: 5000px;
  opacity: 1;
  transform: translateY(0);
}

.bookmarks-section {
  width: 100%;
  margin-top: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  font-size: 16px;
}

/* 响应式 */
@media (max-width: 768px) {
  .top-nav {
    padding: 0 16px;
  }
  .user-name {
    display: none;
  }
  .main-content {
    padding: 72px 16px 40px;
  }
  .nav-title {
    display: none;
  }
}
</style>
