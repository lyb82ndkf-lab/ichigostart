<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-card glass" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCategory ? '编辑分类' : '新建分类' }}</h3>
          <button class="btn btn-ghost btn-sm" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form class="modal-body" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>分类名称</label>
            <input
              ref="nameInput"
              class="input"
              v-model="name"
              placeholder="例如：常用网站"
              maxlength="50"
              autofocus
            />
          </div>

          <div v-if="error" class="error-msg">{{ error }}</div>

          <div class="modal-footer">
            <button class="btn btn-secondary" type="button" @click="$emit('close')">取消</button>
            <button class="btn btn-primary" type="submit">保存</button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script>
export default {
  name: 'AddCategoryModal',
  props: {
    editingCategory: { type: Object, default: null },
  },
  emits: ['close', 'save'],
  data() {
    return {
      name: '',
      error: '',
    }
  },
  mounted() {
    if (this.editingCategory) {
      this.name = this.editingCategory.name
    }
    this.$nextTick(() => {
      this.$refs.nameInput?.focus()
    })
  },
  methods: {
    handleSubmit() {
      this.error = ''
      const trimmed = this.name.trim()
      if (!trimmed) {
        this.error = '请输入分类名称'
        return
      }
      this.$emit('save', {
        id: this.editingCategory?.id || null,
        name: trimmed,
      })
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
  max-width: 400px;
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
</style>
