<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card glass" @click.stop>
        <div class="modal-header">
          <h3>{{ editingBookmark ? '编辑网址' : '添加网址' }}</h3>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>所属分类</label>
            <select class="input" v-model="form.category_id">
              <option value="" disabled>请选择分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
            </select>
          </div>

          <div class="form-group">
            <label>网址名称</label>
            <input class="input" v-model="form.title" placeholder="例如：GitHub" maxlength="50" />
          </div>

          <div class="form-group">
            <label>网址 URL</label>
            <div class="url-input-group">
              <input class="input" v-model="form.url" placeholder="https://example.com" type="url" />
              <button type="button" class="btn btn-secondary btn-sm" @click="autoDetectIcon" :disabled="!form.url">
                自动获取图标
              </button>
            </div>
          </div>

          <div class="form-group">
            <label>图标</label>
            <div class="icon-preview-row">
              <div class="icon-preview">
                <img v-if="form.icon" :src="form.icon" alt="icon" class="preview-img" @error="iconPreviewError = true" />
                <div v-else class="preview-placeholder">
                  {{ form.title ? form.title.charAt(0).toUpperCase() : '?' }}
                </div>
              </div>
              <div class="icon-actions">
                <label class="btn btn-secondary btn-sm upload-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  上传图片
                  <input type="file" accept="image/*" @change="handleUpload" hidden />
                </label>
                <button type="button" class="btn btn-ghost btn-sm" @click="form.icon = ''" v-if="form.icon">清除</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>描述（可选）</label>
            <input class="input" v-model="form.description" placeholder="简单描述一下..." maxlength="100" />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="$emit('close')">取消</button>
            <button class="btn btn-primary" type="submit" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
import { bookmarks as bmApi } from '../api'

export default {
  name: 'AddBookmarkModal',
  props: {
    categoryId: { type: [Number, String], default: null },
    categories: { type: Array, default: () => [] },
    editingBookmark: { type: Object, default: null },
  },
  emits: ['close', 'save'],
  data() {
    return {
      form: {
        category_id: '',
        title: '',
        url: '',
        icon: '',
        description: '',
      },
      error: '',
      loading: false,
      iconPreviewError: false,
    }
  },
  mounted() {
    if (this.editingBookmark) {
      this.form = {
        category_id: this.editingBookmark.category_id,
        title: this.editingBookmark.title,
        url: this.editingBookmark.url,
        icon: this.editingBookmark.icon || '',
        description: this.editingBookmark.description || '',
      }
    } else if (this.categoryId) {
      this.form.category_id = this.categoryId
    }
  },
  methods: {
    handleSubmit() {
      this.error = ''
      if (!this.form.category_id) {
        this.error = '请选择分类'
        return
      }
      if (!this.form.title.trim()) {
        this.error = '请输入名称'
        return
      }
      if (!this.form.url.trim()) {
        this.error = '请输入网址'
        return
      }

      // 确保 URL 有协议前缀
      let url = this.form.url.trim()
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url
      }

      const data = {
        ...this.form,
        url,
        title: this.form.title.trim(),
      }

      if (this.editingBookmark) {
        data.id = this.editingBookmark.id
      }

      this.$emit('save', data)
    },

    autoDetectIcon() {
      try {
        const url = new URL(this.form.url)
        // 使用 Google Favicon 服务
        this.form.icon = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=64`
      } catch {
        // URL 不合法时忽略
      }
    },

    async handleUpload(e) {
      const file = e.target.files[0]
      if (!file) return

      if (file.size > 2 * 1024 * 1024) {
        this.error = '文件大小不能超过 2MB'
        return
      }

      this.loading = true
      try {
        const data = await bmApi.uploadIcon(file)
        this.form.icon = data.url
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
.modal-overlay {
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

.modal-card {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: scaleIn 0.25s ease-out;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 0;
}

.modal-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-body {
  padding: 20px 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.url-input-group {
  display: flex;
  gap: 8px;
}

.url-input-group .input {
  flex: 1;
}

.icon-preview-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-preview {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-md);
  border: 2px solid var(--border-color);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.preview-placeholder {
  font-size: 20px;
  font-weight: 600;
  color: var(--text-muted);
}

.icon-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.upload-btn {
  cursor: pointer;
}

.error-msg {
  padding: 10px 14px;
  background: rgba(255, 71, 87, 0.1);
  color: #ff4757;
  border-radius: var(--radius-sm);
  font-size: 13px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding-top: 8px;
}

select.input {
  appearance: auto;
  cursor: pointer;
}
</style>
