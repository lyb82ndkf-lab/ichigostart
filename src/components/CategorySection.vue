<template>
  <div class="category-section fade-in">
    <div class="category-header">
      <div class="category-title-row">
        <h3 class="category-name">{{ category.name }}</h3>
        <div class="category-actions">
          <button class="btn btn-ghost btn-sm" @click="$emit('add-bookmark')" title="添加书签">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" @click="$emit('edit-category', category)" title="编辑分类">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          </button>
          <button class="btn btn-ghost btn-sm" @click="$emit('delete-category', category.id)" title="删除分类">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          </button>
        </div>
      </div>
      <div class="category-line"></div>
    </div>

    <div class="bookmarks-grid">
      <BookmarkCard
        v-for="bookmark in bookmarks"
        :key="bookmark.id"
        :bookmark="bookmark"
        @edit="$emit('edit-bookmark', bookmark)"
        @delete="$emit('delete-bookmark', bookmark.id)"
      />

      <!-- 添加按钮卡片 -->
      <div class="add-card" @click="$emit('add-bookmark')">
        <div class="add-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </div>
        <span class="add-text">添加网址</span>
      </div>
    </div>
  </div>
</template>

<script>
import BookmarkCard from './BookmarkCard.vue'

export default {
  name: 'CategorySection',
  components: { BookmarkCard },
  props: {
    category: { type: Object, required: true },
    bookmarks: { type: Array, default: () => [] },
  },
  emits: ['add-bookmark', 'edit-bookmark', 'delete-bookmark', 'edit-category', 'delete-category'],
}
</script>

<style scoped>
.category-section {
  margin-bottom: 36px;
}

.category-header {
  margin-bottom: 18px;
}

.category-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.category-name {
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.category-actions {
  display: flex;
  gap: 2px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.category-section:hover .category-actions {
  opacity: 1;
}

.category-line {
  height: 2px;
  background: linear-gradient(90deg, var(--primary), transparent);
  border-radius: 1px;
  opacity: 0.4;
}

.bookmarks-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
}

/* 添加按钮卡片 */
.add-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 100px;
  min-height: 100px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: var(--text-muted);
}

.add-card:hover {
  border-color: var(--primary);
  color: var(--primary);
  background: var(--primary-light);
  transform: translateY(-2px);
}

.add-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--bg-card);
  transition: background var(--transition-fast);
}

.add-card:hover .add-icon {
  background: var(--primary);
  color: #fff;
}

.add-text {
  font-size: 12px;
}

@media (max-width: 600px) {
  .bookmarks-grid {
    grid-template-columns: repeat(auto-fill, minmax(90px, 1fr));
    gap: 12px;
  }
  .category-actions {
    opacity: 1;
  }
}
</style>
