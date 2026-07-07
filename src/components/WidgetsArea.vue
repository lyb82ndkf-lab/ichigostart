<template>
  <div>
    <!-- 1. 左侧挂件栏 (仅在宽屏且有左侧挂件时渲染) -->
    <div
      v-if="leftWidgets.length > 0"
      class="widgets-sidebar pos-left"
      :class="{ 'collapsed': collapsedSetting && !leftExpanded }"
    >
      <!-- 收纳状态下的展开标签 -->
      <div
        v-if="collapsedSetting && !leftExpanded"
        class="widgets-toggle-tab tab-left"
        @click="leftExpanded = true"
        title="展开左侧挂件"
      >
        <el-icon><DArrowRight /></el-icon>
        <span class="tab-text">挂件</span>
      </div>

      <!-- 展开状态下的侧栏内容 -->
      <div v-else class="sidebar-inner" @mouseleave="leftExpanded = false">
        <!-- 折叠收纳下的关闭悬浮按钮 -->
        <div
          v-if="collapsedSetting"
          class="sidebar-floating-close"
          @click="leftExpanded = false"
          title="收起左侧挂件"
        >
          <el-icon><Close /></el-icon>
        </div>
        <div class="widgets-column-grid">
          <transition-group name="list">
            <div
              v-for="widget in leftWidgets"
              :key="widget.id"
              class="widget-rect-card"
              :class="widget.type"
              @contextmenu.prevent="openContextMenu($event, widget)"
            >
              <div class="widget-rect-inner">
                <!-- 左侧图标 (对齐至左上角) -->
                <el-icon class="widget-rect-icon" :size="15">
                  <Calendar v-if="widget.type === 'countdown'" />
                  <CircleCheck v-else-if="widget.type === 'counter'" />
                  <Notebook v-else-if="widget.type === 'note'" />
                </el-icon>

                <!-- 中间内容区域 -->
                <div class="widget-rect-main">
                  <!-- 倒计时/纪念日 (显示为一行流畅的人性化语句) -->
                  <template v-if="widget.type === 'countdown'">
                    <div class="countdown-rect-info">
                      <span class="rect-title">
                        {{ getCountdownDays(widget).prefix }}
                        <strong class="highlight-title">{{ widget.title }}</strong>
                        {{ getCountdownDays(widget).suffix }}
                      </span>
                    </div>
                    <div class="countdown-rect-value" :class="getCountdownClass(widget)">
                      <span class="rect-num" v-if="getCountdownDays(widget).absDays > 0">
                        {{ getCountdownDays(widget).absDays }}
                      </span>
                      <span class="rect-unit" v-if="getCountdownDays(widget).absDays > 0">天</span>
                    </div>
                  </template>

                  <!-- 计数器 (仅展示名称与当前次数，移除了前端加减动作条) -->
                  <template v-else-if="widget.type === 'counter'">
                    <div class="counter-rect-info">
                      <span class="rect-title">{{ widget.title }}</span>
                    </div>
                    <div class="counter-rect-value">
                      <span class="rect-num">{{ widget.contentVal }}</span>
                      <span class="rect-unit">次</span>
                    </div>
                  </template>

                  <!-- 便签 (使用原生 textarea 自适应高度，避开 ElInput 的 Flex 宽高计算 Bug) -->
                  <template v-else-if="widget.type === 'note'">
                    <div class="note-rect-content">
                      <textarea
                        class="note-rect-textarea"
                        v-model="widget.contentVal"
                        placeholder="写点什么..."
                        @blur="saveNote(widget)"
                        @input="adjustTextareaHeight($event.target); onNoteInput(widget)"
                        rows="1"
                      ></textarea>
                      <div class="note-save-status-rect" :class="{ visible: widget.saving }">
                        <el-icon class="is-loading"><Loading /></el-icon>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- 右侧动作按钮 (对齐至右上角) -->
                <div class="widget-rect-right">
                  <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, widget)">
                    <span class="rect-action-btn">
                      <el-icon :size="14"><MoreFilled /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="align-right">移至右侧</el-dropdown-item>
                        <el-dropdown-item command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- 2. 右侧挂件栏 (仅在宽屏且有右侧挂件时渲染) -->
    <div
      v-if="rightWidgets.length > 0"
      class="widgets-sidebar pos-right"
      :class="{ 'collapsed': collapsedSetting && !rightExpanded }"
    >
      <!-- 收纳状态下的展开标签 -->
      <div
        v-if="collapsedSetting && !rightExpanded"
        class="widgets-toggle-tab tab-right"
        @click="rightExpanded = true"
        title="展开右侧挂件"
      >
        <el-icon><DArrowLeft /></el-icon>
        <span class="tab-text">挂件</span>
      </div>

      <!-- 展开状态下的侧栏内容 -->
      <div v-else class="sidebar-inner" @mouseleave="rightExpanded = false">
        <!-- 折叠收纳下的关闭悬浮按钮 -->
        <div
          v-if="collapsedSetting"
          class="sidebar-floating-close"
          @click="rightExpanded = false"
          title="收起右侧挂件"
        >
          <el-icon><Close /></el-icon>
        </div>
        <div class="widgets-column-grid">
          <transition-group name="list">
            <div
              v-for="widget in rightWidgets"
              :key="widget.id"
              class="widget-rect-card"
              :class="widget.type"
              @contextmenu.prevent="openContextMenu($event, widget)"
            >
              <div class="widget-rect-inner">
                <!-- 左侧图标 (对齐至左上角) -->
                <el-icon class="widget-rect-icon" :size="15">
                  <Calendar v-if="widget.type === 'countdown'" />
                  <CircleCheck v-else-if="widget.type === 'counter'" />
                  <Notebook v-else-if="widget.type === 'note'" />
                </el-icon>

                <!-- 中间内容区域 -->
                <div class="widget-rect-main">
                  <!-- 倒计时/纪念日 (人性化一行语句) -->
                  <template v-if="widget.type === 'countdown'">
                    <div class="countdown-rect-info">
                      <span class="rect-title">
                        {{ getCountdownDays(widget).prefix }}
                        <strong class="highlight-title">{{ widget.title }}</strong>
                        {{ getCountdownDays(widget).suffix }}
                      </span>
                    </div>
                    <div class="countdown-rect-value" :class="getCountdownClass(widget)">
                      <span class="rect-num" v-if="getCountdownDays(widget).absDays > 0">
                        {{ getCountdownDays(widget).absDays }}
                      </span>
                      <span class="rect-unit" v-if="getCountdownDays(widget).absDays > 0">天</span>
                    </div>
                  </template>

                  <!-- 计数器 (仅展示值，无前后端加减) -->
                  <template v-else-if="widget.type === 'counter'">
                    <div class="counter-rect-info">
                      <span class="rect-title">{{ widget.title }}</span>
                    </div>
                    <div class="counter-rect-value">
                      <span class="rect-num">{{ widget.contentVal }}</span>
                      <span class="rect-unit">次</span>
                    </div>
                  </template>

                  <!-- 便签 (使用原生 textarea 自适应高度，避开 ElInput 的 Flex 宽高计算 Bug) -->
                  <template v-else-if="widget.type === 'note'">
                    <div class="note-rect-content">
                      <textarea
                        class="note-rect-textarea"
                        v-model="widget.contentVal"
                        placeholder="写点什么..."
                        @blur="saveNote(widget)"
                        @input="adjustTextareaHeight($event.target); onNoteInput(widget)"
                        rows="1"
                      ></textarea>
                      <div class="note-save-status-rect" :class="{ visible: widget.saving }">
                        <el-icon class="is-loading"><Loading /></el-icon>
                      </div>
                    </div>
                  </template>
                </div>

                <!-- 右侧动作按钮 (对齐至右上角) -->
                <div class="widget-rect-right">
                  <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, widget)">
                    <span class="rect-action-btn">
                      <el-icon :size="14"><MoreFilled /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="edit">编辑</el-dropdown-item>
                        <el-dropdown-item command="align-left">移至左侧</el-dropdown-item>
                        <el-dropdown-item command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </div>
          </transition-group>
        </div>
      </div>
    </div>

    <!-- 3. 移动端/折叠流布局 (仅在小屏幕且有挂件时渲染) -->
    <div
      v-if="widgetList.length > 0"
      class="widgets-mobile-area"
    >
      <div class="widgets-mobile-grid">
        <transition-group name="list">
          <div
            v-for="widget in widgetList"
            :key="widget.id"
            class="widget-rect-card mobile-card"
            :class="widget.type"
            @contextmenu.prevent="openContextMenu($event, widget)"
          >
            <div class="widget-rect-inner">
              <el-icon class="widget-rect-icon" :size="15">
                <Calendar v-if="widget.type === 'countdown'" />
                <CircleCheck v-else-if="widget.type === 'counter'" />
                <Notebook v-else-if="widget.type === 'note'" />
              </el-icon>

              <div class="widget-rect-main">
                <template v-if="widget.type === 'countdown'">
                  <div class="countdown-rect-info">
                    <span class="rect-title">
                      {{ getCountdownDays(widget).prefix }}
                      <strong class="highlight-title">{{ widget.title }}</strong>
                      {{ getCountdownDays(widget).suffix }}
                    </span>
                  </div>
                  <div class="countdown-rect-value" :class="getCountdownClass(widget)">
                    <span class="rect-num" v-if="getCountdownDays(widget).absDays > 0">
                      {{ getCountdownDays(widget).absDays }}
                    </span>
                    <span class="rect-unit" v-if="getCountdownDays(widget).absDays > 0">天</span>
                  </div>
                </template>

                <template v-else-if="widget.type === 'counter'">
                  <div class="counter-rect-info">
                    <span class="rect-title">{{ widget.title }}</span>
                  </div>
                  <div class="counter-rect-value">
                    <span class="rect-num">{{ widget.contentVal }}</span>
                    <span class="rect-unit">次</span>
                  </div>
                </template>

                <!-- 便签 (使用原生 textarea 自适应高度，避开 ElInput 的 Flex 宽高计算 Bug) -->
                <template v-else-if="widget.type === 'note'">
                  <div class="note-rect-content">
                    <textarea
                      class="note-rect-textarea"
                      v-model="widget.contentVal"
                      placeholder="写点什么..."
                      @blur="saveNote(widget)"
                      @input="adjustTextareaHeight($event.target); onNoteInput(widget)"
                      rows="1"
                    ></textarea>
                    <div class="note-save-status-rect" :class="{ visible: widget.saving }">
                      <el-icon class="is-loading"><Loading /></el-icon>
                    </div>
                  </div>
                </template>
              </div>

              <div class="widget-rect-right">
                <el-dropdown trigger="click" @command="(cmd) => handleCommand(cmd, widget)">
                  <span class="rect-action-btn">
                    <el-icon :size="14"><MoreFilled /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="edit">编辑</el-dropdown-item>
                      <el-dropdown-item :command="widget.position === 'left' ? 'align-right' : 'align-left'">
                        移至{{ widget.position === 'left' ? '右' : '左' }}侧
                      </el-dropdown-item>
                      <el-dropdown-item command="delete" style="color: #f56c6c;">删除</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </div>
        </transition-group>
      </div>
    </div>

    <!-- 4. 挂件添加/编辑对话框 (关闭 scroll-lock 以防止时间组件和排版晃动) -->
    <!-- 添加挂件对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加挂件"
      width="460px"
      align-center
      class="widget-dialog-rect"
      :lock-scroll="false"
    >
      <el-form :model="form" label-position="top" ref="widgetForm" :rules="rules">
        <el-form-item label="挂件类型" prop="type">
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio-button label="countdown">倒计时/纪念日</el-radio-button>
            <el-radio-button label="counter">计数器</el-radio-button>
            <el-radio-button label="note">便签</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item
          v-if="form.type !== 'note'"
          :label="form.type === 'countdown' ? '事件名称' : '计数器名称'"
          prop="title"
        >
          <el-input v-model="form.title" placeholder="例如：高考、背单词、喝水" />
        </el-form-item>

        <el-form-item v-if="form.type === 'countdown'" label="目标日期" prop="date">
          <el-date-picker
            v-model="form.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="form.type === 'counter'" label="初始值" prop="initialValue">
          <el-input-number v-model="form.initialValue" :min="0" style="width: 100%" />
        </el-form-item>

        <el-form-item v-if="form.type === 'note'" label="内容" prop="noteContent">
          <el-input
            v-model="form.noteContent"
            type="textarea"
            :rows="3"
            placeholder="输入便签内容..."
          />
        </el-form-item>

        <el-form-item label="摆放位置" prop="position">
          <el-radio-group v-model="form.position">
            <el-radio-button label="left">左边栏</el-radio-button>
            <el-radio-button label="right">右边栏</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑挂件对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑挂件"
      width="460px"
      align-center
      class="widget-dialog-rect"
      :lock-scroll="false"
    >
      <el-form :model="editForm" label-position="top" ref="editWidgetForm" :rules="rules">
        <el-form-item
          v-if="editForm.type !== 'note'"
          :label="editForm.type === 'countdown' ? '事件名称' : '计数器名称'"
          prop="title"
        >
          <el-input v-model="editForm.title" placeholder="请输入名称" />
        </el-form-item>

        <el-form-item v-if="editForm.type === 'countdown'" label="目标日期" prop="date">
          <el-date-picker
            v-model="editForm.date"
            type="date"
            placeholder="选择日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item v-if="editForm.type === 'counter'" label="当前值" prop="initialValue">
          <el-input-number v-model="editForm.initialValue" style="width: 100%" />
        </el-form-item>

        <el-form-item v-if="editForm.type === 'note'" label="内容" prop="noteContent">
          <el-input
            v-model="editForm.noteContent"
            type="textarea"
            :rows="3"
            placeholder="请输入内容"
          />
        </el-form-item>

        <el-form-item label="摆放位置" prop="position">
          <el-radio-group v-model="editForm.position">
            <el-radio-button label="left">左边栏</el-radio-button>
            <el-radio-button label="right">右边栏</el-radio-button>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEditForm">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 5. 自定义高级直角右键菜单 -->
    <Teleport to="body">
      <div
        v-if="showContextMenu"
        class="custom-context-menu"
        :style="{ left: contextMenuX + 'px', top: contextMenuY + 'px' }"
        @click="showContextMenu = false"
      >
        <div class="menu-item" @click="handleContextMenuCommand('edit')">编辑挂件</div>
        <template v-if="contextMenuWidget && contextMenuWidget.type === 'counter'">
          <div class="menu-item" @click="handleContextMenuCommand('inc')">次数 + 1</div>
          <div class="menu-item" @click="handleContextMenuCommand('dec')">次数 - 1</div>
          <div class="menu-item" @click="handleContextMenuCommand('set-val')">更改具体数值</div>
        </template>
        <template v-if="contextMenuWidget">
          <div
            v-if="contextMenuWidget.position === 'right'"
            class="menu-item"
            @click="handleContextMenuCommand('align-left')"
          >移至左侧</div>
          <div
            v-else
            class="menu-item"
            @click="handleContextMenuCommand('align-right')"
          >移至右侧</div>
        </template>
        <div class="menu-divider"></div>
        <div class="menu-item danger" @click="handleContextMenuCommand('delete')">删除挂件</div>
      </div>
    </Teleport>

    <!-- 6. 右下角悬浮添加触碰区 -->
    <div class="add-widget-hover-zone">
      <div class="add-widget-btn" @click="openAddDialog" title="添加新挂件">
        <el-icon :size="24"><Plus /></el-icon>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, defineProps, nextTick } from 'vue'
import { widgets as widgetsApi } from '../api'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Calendar,
  CircleCheck,
  Notebook,
  MoreFilled,
  Plus,
  Loading,
  DArrowLeft,
  DArrowRight,
  Close
} from '@element-plus/icons-vue'

// 声明传入属性
defineProps({
  collapsedSetting: { type: Boolean, default: false },
  scaleSetting: { type: Number, default: 100 },
  widthSetting: { type: Number, default: 290 }
})

const widgetList = ref([])
const dialogVisible = ref(false)
const editDialogVisible = ref(false)

const leftExpanded = ref(false)
const rightExpanded = ref(false)

// 右键菜单状态
const showContextMenu = ref(false)
const contextMenuX = ref(0)
const contextMenuY = ref(0)
const contextMenuWidget = ref(null)

const widgetForm = ref(null)
const editWidgetForm = ref(null)

const form = ref({
  type: 'countdown',
  title: '',
  date: '',
  initialValue: 0,
  noteContent: '',
  position: 'right'
})

const editForm = ref({
  id: null,
  type: '',
  title: '',
  date: '',
  initialValue: 0,
  noteContent: '',
  position: 'right'
})

const rules = {
  title: [
    { required: true, message: '请输入挂件名称', trigger: 'blur' },
    { max: 50, message: '长度不能超过 50 个字符', trigger: 'blur' }
  ],
  date: [
    { required: true, message: '请选择目标日期', trigger: 'change' }
  ]
}

// 区分左边和右边挂件列表的计算属性
const leftWidgets = computed(() => {
  return widgetList.value.filter(w => w.position === 'left')
})

const rightWidgets = computed(() => {
  return widgetList.value.filter(w => w.position === 'right')
})

// 注册右键菜单监听
const openContextMenu = (event, widget) => {
  contextMenuWidget.value = widget
  contextMenuX.value = event.clientX
  contextMenuY.value = event.clientY
  showContextMenu.value = true
}

const handleContextMenuCommand = async (cmd) => {
  const widget = contextMenuWidget.value
  if (!widget) return
  showContextMenu.value = false

  if (cmd === 'edit') {
    openEditDialog(widget)
  } else if (cmd === 'align-left') {
    await updatePosition(widget, 'left')
  } else if (cmd === 'align-right') {
    await updatePosition(widget, 'right')
  } else if (cmd === 'delete') {
    confirmDelete(widget)
  } else if (cmd === 'inc') {
    updateCounter(widget, 1)
  } else if (cmd === 'dec') {
    updateCounter(widget, -1)
  } else if (cmd === 'set-val') {
    ElMessageBox.prompt('请输入新的数值', '修改计数器数值', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputPattern: /^-?\d+$/,
      inputErrorMessage: '请输入有效的整数',
      inputValue: String(widget.contentVal),
      lockScroll: false
    }).then(async ({ value }) => {
      const newVal = parseInt(value) || 0
      widget.contentVal = newVal
      try {
        await widgetsApi.update(widget.id, { content: String(newVal) })
        ElMessage.success('数值修改成功')
      } catch (err) {
        ElMessage.error('保存失败: ' + err.message)
      }
    }).catch(() => {})
  }
}

const closeContextMenu = () => {
  showContextMenu.value = false
}

onMounted(() => {
  loadWidgets()
  window.addEventListener('click', closeContextMenu)
})

onBeforeUnmount(() => {
  window.removeEventListener('click', closeContextMenu)
})

const loadWidgets = async () => {
  try {
    const data = await widgetsApi.list()
    widgetList.value = data.widgets.map(w => {
      let contentVal = w.content
      if (w.type === 'counter') {
        contentVal = parseInt(w.content) || 0
      }
      return {
        ...w,
        contentVal,
        saving: false,
        debounceTimer: null
      }
    })
    nextTick(() => {
      // 遍历所有文本框自动计算高度
      const textareas = document.querySelectorAll('.note-rect-textarea')
      textareas.forEach(el => {
        adjustTextareaHeight(el)
      })
    })
  } catch (err) {
    ElMessage.error('加载挂件失败: ' + err.message)
  }
}

const adjustTextareaHeight = (el) => {
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

// 挂件操作事件
const handleCommand = async (cmd, widget) => {
  if (cmd === 'edit') {
    openEditDialog(widget)
  } else if (cmd === 'align-left') {
    await updatePosition(widget, 'left')
  } else if (cmd === 'align-right') {
    await updatePosition(widget, 'right')
  } else if (cmd === 'delete') {
    confirmDelete(widget)
  }
}

const updatePosition = async (widget, pos) => {
  try {
    await widgetsApi.update(widget.id, { position: pos })
    widget.position = pos
    ElMessage.success('位置修改成功')
  } catch (err) {
    ElMessage.error('位置修改失败: ' + err.message)
  }
}

const openAddDialog = () => {
  form.value = {
    type: 'countdown',
    title: '',
    date: new Date().toISOString().split('T')[0],
    initialValue: 0,
    noteContent: '',
    position: 'right'
  }
  dialogVisible.value = true
}

const handleTypeChange = (val) => {
  if (val === 'countdown') {
    form.value.title = ''
    form.value.date = new Date().toISOString().split('T')[0]
  } else if (val === 'counter') {
    form.value.title = ''
    form.value.initialValue = 0
  } else if (val === 'note') {
    form.value.noteContent = ''
  }
}

const submitForm = () => {
  widgetForm.value.validate(async (valid) => {
    if (!valid) return

    let content = ''
    if (form.value.type === 'countdown') {
      content = form.value.date
    } else if (form.value.type === 'counter') {
      content = String(form.value.initialValue)
    } else if (form.value.type === 'note') {
      content = form.value.noteContent
    }

    try {
      await widgetsApi.create({
        type: form.value.type,
        title: form.value.title,
        content: content,
        position: form.value.position,
        sort_order: widgetList.value.length
      })
      ElMessage.success('创建挂件成功')
      dialogVisible.value = false
      loadWidgets()
    } catch (err) {
      ElMessage.error('创建挂件失败: ' + err.message)
    }
  })
}

const openEditDialog = (widget) => {
  editForm.value = {
    id: widget.id,
    type: widget.type,
    title: widget.title,
    date: widget.type === 'countdown' ? widget.content : '',
    initialValue: widget.type === 'counter' ? widget.contentVal : 0,
    noteContent: widget.type === 'note' ? widget.contentVal : '',
    position: widget.position || 'right'
  }
  editDialogVisible.value = true
}

const submitEditForm = () => {
  editWidgetForm.value.validate(async (valid) => {
    if (!valid) return

    let content = ''
    if (editForm.value.type === 'countdown') {
      content = editForm.value.date
    } else if (editForm.value.type === 'counter') {
      content = String(editForm.value.initialValue)
    } else if (editForm.value.type === 'note') {
      content = editForm.value.noteContent
    }

    try {
      await widgetsApi.update(editForm.value.id, {
        title: editForm.value.title,
        content: content,
        position: editForm.value.position
      })
      ElMessage.success('修改成功')
      editDialogVisible.value = false
      loadWidgets()
    } catch (err) {
      ElMessage.error('修改失败: ' + err.message)
    }
  })
}

const confirmDelete = (widget) => {
  ElMessageBox.confirm(
    `确定要删除 "${widget.title || '便签'}" 挂件吗?`,
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
      alignCenter: true,
      lockScroll: false
    }
  ).then(async () => {
    try {
      await widgetsApi.remove(widget.id)
      ElMessage.success('删除成功')
      loadWidgets()
    } catch (err) {
      ElMessage.error('删除失败: ' + err.message)
    }
  }).catch(() => {})
}

const updateCounter = (widget, diff) => {
  widget.contentVal += diff
  if (widget.debounceTimer) clearTimeout(widget.debounceTimer)
  widget.debounceTimer = setTimeout(async () => {
    try {
      await widgetsApi.update(widget.id, { content: String(widget.contentVal) })
    } catch (err) {
      console.error('更新计数器失败:', err)
      ElMessage.error('保存计数失败')
    }
  }, 400)
}

const onNoteInput = (widget) => {
  widget.saving = true
}

const saveNote = async (widget) => {
  widget.saving = true
  try {
    await widgetsApi.update(widget.id, { content: widget.contentVal })
  } catch (err) {
    console.error('保存便签失败:', err)
    ElMessage.error('便签保存失败')
  } finally {
    setTimeout(() => {
      widget.saving = false
    }, 300)
  }
}

const getCountdownDays = (widget) => {
  if (!widget.content) return { absDays: 0, prefix: '', suffix: '无日期' }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(widget.content)
  target.setHours(0, 0, 0, 0)
  const diffTime = target.getTime() - today.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays > 0) {
    return { absDays: diffDays, prefix: '距离', suffix: '还有' }
  } else if (diffDays < 0) {
    return { absDays: Math.abs(diffDays), prefix: '', suffix: '已经过了' }
  } else {
    return { absDays: 0, prefix: '', suffix: '就是今天' }
  }
}

const getCountdownClass = (widget) => {
  const diff = new Date(widget.content).getTime() - new Date().setHours(0,0,0,0)
  if (diff > 0) return 'text-countdown-rect'
  if (diff < 0) return 'text-anniversary-rect'
  return 'text-today-rect'
}
</script>

<style scoped>
/* ==========================================
   🧱 矩形直角挂件 - 样式重设计
   ========================================== */

/* 1. 宽屏下的固定侧边栏与收纳样式 */
@media (min-width: 1100px) {
  .widgets-sidebar {
    position: fixed;
    top: 90px;
    width: var(--widget-width, 290px);
    max-height: calc(100vh - 140px);
    z-index: 90;
    transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease, width 0.3s;
    transform: scale(var(--widget-scale, 1));
    box-sizing: border-box;
    /* 大容器完全透明，隐藏背景 */
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
  }

  .widgets-sidebar.pos-left {
    left: 24px;
    transform-origin: top left;
  }

  .widgets-sidebar.pos-right {
    right: 24px;
    transform-origin: top right;
  }

  /* 收纳折叠状态下的缩进 */
  .widgets-sidebar.collapsed {
    width: 0 !important;
    background: transparent !important;
    border: none !important;
    box-shadow: none !important;
    backdrop-filter: none !important;
    pointer-events: none;
    overflow: visible;
  }

  .widgets-sidebar.collapsed .sidebar-inner {
    opacity: 0;
    transform: scale(0.9) translateX(var(--sidebar-translate-dir, 0));
    pointer-events: none;
  }

  .sidebar-inner {
    width: 100%;
    /* 容器隐形，不留多余底色与边框 */
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    position: relative;
    transition: transform 0.3s ease, opacity 0.3s ease;
    opacity: 1;
    transform: scale(1) translateX(0);
  }

  .pos-left .sidebar-inner {
    --sidebar-translate-dir: -20px;
  }

  .pos-right .sidebar-inner {
    --sidebar-translate-dir: 20px;
  }

  /* 悬浮关闭小按钮 */
  .sidebar-floating-close {
    position: absolute;
    top: -10px;
    right: -10px;
    width: 20px;
    height: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-muted);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 105;
    box-shadow: var(--shadow-sm);
    border-radius: 0 !important; /* 直角 */
    transition: all 0.3s;
  }

  .sidebar-floating-close:hover {
    color: var(--primary);
    border-color: var(--primary);
  }

  /* 收纳时的极简玻璃拉手 handle */
  .widgets-toggle-tab {
    pointer-events: auto;
    position: fixed;
    top: 40%;
    transform: translateY(-50%);
    width: 6px;
    height: 60px;
    background: var(--border-color);
    opacity: 0.6;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    z-index: 100;
    overflow: hidden;
    color: transparent;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .tab-left {
    left: 0;
    border-radius: 0 4px 4px 0 !important;
  }

  .tab-right {
    right: 0;
    border-radius: 4px 0 0 4px !important;
  }

  .widgets-toggle-tab:hover {
    width: 24px;
    opacity: 1;
    background: var(--primary);
    color: white;
  }

  .widgets-toggle-tab .el-icon {
    font-size: 14px;
  }

  /* 去掉文字，更加极简 */
  .tab-text {
    display: none;
  }

  .widgets-column-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 140px);
    overflow-y: auto;
    padding-right: 4px;
    pointer-events: auto;
  }

  /* 宽屏隐藏移动端区域 */
  .widgets-mobile-area {
    display: none;
  }
}

/* 2. 移动端/小屏幕下的网格样式 */
@media (max-width: 1099px) {
  /* 小屏幕隐藏左/右侧栏，仅在下方显示流布局 */
  .widgets-sidebar {
    display: none;
  }

  .widgets-mobile-area {
    width: 100%;
    max-width: 640px;
    margin: 24px auto 0;
    padding: 0 16px;
    box-sizing: border-box;
  }

  .widgets-mobile-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 12px;
    width: 100%;
  }

  .mobile-card {
    width: 100% !important;
  }
}

/* 3. 统一的长条矩形直角挂件卡片样式 */
.widget-rect-card {
  position: relative;
  width: 100%;
  box-shadow: var(--shadow-sm);
  box-sizing: border-box;
  /* 直角设计，彻底取消圆角 */
  border-radius: 0 !important;
  border: 1px solid var(--border-color);
  background: var(--bg-card);
  transition: transform var(--transition-fast), border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.widget-rect-card.countdown,
.widget-rect-card.counter {
  height: 64px; /* 倒计时与计数器卡片高度固定 */
}

.widget-rect-card.note {
  min-height: 44px; /* 最矮可收缩到 44px (完全自适应) */
  height: auto !important; /* 便签高度自适应包裹内容 */
  padding: 6px 12px;
}

.widget-rect-card:hover {
  border-color: var(--primary);
  box-shadow: 0 4px 12px var(--primary-light);
}

.widget-rect-inner {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start; /* 图标、内容、按钮全部顶端对齐，适配便签伸缩 */
  gap: 12px;
  padding: 12px 14px;
  box-sizing: border-box;
}

.widget-rect-icon {
  color: var(--primary);
  flex-shrink: 0;
  margin-top: 2px; /* 让图标与单行文本或输入框首行物理水平居中对齐 */
  margin-left: 4px; /* 侧边边距变宽，防止靠边太近 */
}

.widget-rect-main {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  overflow: hidden;
  margin-top: 1px;
}

.widget-rect-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-top: 1px; /* 确保动作三点也顶端对齐 */
}

.rect-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.3s;
}

.rect-action-btn:hover {
  color: var(--primary);
}

/* A. 倒计时长条样式 (整句人性化显示) */
.countdown-rect-info {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
  flex: 1;
  text-align: left;
}

.rect-title {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  line-height: 1.4;
  word-break: break-all;
}

.highlight-title {
  color: var(--primary);
  font-weight: 600;
  padding: 0 2px;
}

.countdown-rect-value {
  display: flex;
  align-items: baseline;
  margin-right: 4px;
  flex-shrink: 0;
  margin-left: 10px;
}

.rect-num {
  font-size: 20px;
  font-weight: 700;
}

.rect-unit {
  font-size: 11px;
  margin-left: 2px;
  color: var(--text-secondary);
}

.text-countdown-rect {
  color: var(--primary);
}

.text-anniversary-rect {
  color: #3d85e0;
}

[data-color="green"] .text-anniversary-rect {
  color: #5aa000;
}

.text-today-rect {
  color: #ff9f43;
  font-weight: 700;
}

/* B. 计数器长条样式 */
.counter-rect-info {
  flex: 1;
  text-align: left;
  min-width: 0;
}

.counter-rect-value {
  display: flex;
  align-items: baseline;
  margin-right: 4px;
  flex-shrink: 0;
  margin-left: 10px;
  color: var(--text-secondary);
}

/* C. 便签长条样式 (原生 textarea 自适应高度，修复 flex 布局 100% 容器占满全屏 bug) */
.note-rect-content {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}

.note-rect-textarea {
  width: 100%;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  padding: 0 !important;
  color: var(--text-primary) !important;
  resize: none !important;
  font-size: 13px;
  line-height: 1.4;
  font-family: inherit;
  outline: none !important;
  height: auto;
  overflow: hidden; /* 隐藏滚动条 */
  display: block;
}

.note-rect-textarea::placeholder {
  color: var(--text-muted);
  font-style: italic;
}

.note-save-status-rect {
  position: absolute;
  right: 0;
  bottom: 0px;
  color: var(--text-muted);
  font-size: 10px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
}

.note-save-status-rect.visible {
  opacity: 1;
}

/* 4. 右下角悬浮添加触发区与按钮 */
.add-widget-hover-zone {
  display: flex;
  position: fixed;
  bottom: 16px;
  right: 16px;
  width: 64px;
  height: 64px;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.add-widget-btn {
  width: 46px;
  height: 46px;
  background: var(--primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 75, 110, 0.4);
  cursor: pointer;
  opacity: 0.85; /* 移动端常驻可见 */
  transform: scale(1);
  transition: opacity 0.3s ease, transform 0.3s ease, background-color 0.3s, box-shadow 0.3s;
  /* 直角设计 */
  border-radius: 0 !important;
}

.add-widget-btn:active {
  transform: scale(0.9);
}

@media (min-width: 1100px) {
  .add-widget-hover-zone {
    bottom: 0;
    right: 0;
    width: 110px;
    height: 110px;
  }

  .add-widget-btn {
    opacity: 0; /* 宽屏下默认隐藏 */
    transform: scale(0.8);
  }

  .add-widget-hover-zone:hover .add-widget-btn {
    opacity: 1;
    transform: scale(1);
  }

  .add-widget-btn:hover {
    background: var(--primary-dark);
    box-shadow: 0 6px 16px rgba(255, 75, 110, 0.6);
  }
}

/* 5. 高级自定义右键菜单样式 */
.custom-context-menu {
  position: fixed;
  background: var(--bg-card);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md);
  z-index: 2000;
  padding: 4px 0;
  min-width: 130px;
  border-radius: 0 !important; /* 直角 */
  box-sizing: border-box;
}

.custom-context-menu .menu-item {
  padding: 8px 14px;
  font-size: 12px;
  color: var(--text-primary);
  cursor: pointer;
  text-align: left;
  transition: background 0.2s, color 0.2s;
  user-select: none;
}

.custom-context-menu .menu-item:hover {
  background: var(--primary);
  color: white;
}

.custom-context-menu .menu-item.danger {
  color: #f56c6c;
}

.custom-context-menu .menu-item.danger:hover {
  background: #f56c6c;
  color: white;
}

.custom-context-menu .menu-divider {
  height: 1px;
  background: var(--border-color);
  margin: 4px 0;
}

/* Transition list */
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* 弹窗直角样式覆盖 */
:deep(.widget-dialog-rect) {
  border-radius: 0 !important; /* 直角 */
  background: var(--bg-secondary);
}

:deep(.widget-dialog-rect .el-radio-button__inner) {
  border-radius: 0 !important; /* 直角 */
  margin-right: 8px;
  border: 1px solid var(--border-color) !important;
}

:deep(.widget-dialog-rect .el-radio-button:last-child .el-radio-button__inner) {
  margin-right: 0;
}

:deep(.widget-dialog-rect .el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background-color: var(--primary);
  border-color: var(--primary) !important;
  box-shadow: -1px 0 0 0 var(--primary) !important;
}

:deep(.widget-dialog-rect .el-input__wrapper),
:deep(.widget-dialog-rect .el-textarea__inner),
:deep(.widget-dialog-rect .el-input-number) {
  border-radius: 0 !important; /* 所有表单组件均采用直角 */
}
</style>
