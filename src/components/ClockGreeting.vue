<template>
  <div class="clock-greeting" @click="$emit('click-clock')">
    <div class="greeting-text">{{ greeting }}</div>
    <div class="time-display">
      <span class="time">{{ time }}</span>
    </div>
    <div class="date-display">{{ date }}</div>
  </div>
</template>

<script>
export default {
  name: 'ClockGreeting',
  props: {
    nickname: { type: String, default: '' },
    expanded: { type: Boolean, default: false },
  },
  emits: ['click-clock'],
  data() {
    return {
      time: '',
      date: '',
      greeting: '',
      timer: null,
    }
  },
  mounted() {
    this.updateTime()
    this.timer = setInterval(this.updateTime, 1000)
  },
  beforeUnmount() {
    clearInterval(this.timer)
  },
  methods: {
    updateTime() {
      const now = new Date()
      const h = now.getHours()
      const m = String(now.getMinutes()).padStart(2, '0')
      const s = String(now.getSeconds()).padStart(2, '0')
      this.time = `${String(h).padStart(2, '0')}:${m}:${s}`

      const weekDays = ['日', '一', '二', '三', '四', '五', '六']
      this.date = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 星期${weekDays[now.getDay()]}`

      let greet = ''
      if (h < 6) greet = '夜深了'
      else if (h < 9) greet = '早上好'
      else if (h < 12) greet = '上午好'
      else if (h < 14) greet = '中午好'
      else if (h < 18) greet = '下午好'
      else if (h < 22) greet = '晚上好'
      else greet = '夜深了'

      this.greeting = this.nickname ? `${greet}，${this.nickname}` : greet
    },
  },
}
</script>

<style scoped>
.clock-greeting {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeIn 0.6s ease-out;
  cursor: pointer;
  user-select: none;
  transition: transform var(--transition-fast);
}

.clock-greeting:hover {
  transform: scale(1.02);
}

.greeting-text {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.time-display {
  display: flex;
  justify-content: center;
}

.time {
  font-size: 72px;
  font-weight: 700;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 4px;
  line-height: 1;
}

.date-display {
  font-size: 15px;
  color: var(--text-muted);
  margin-top: 10px;
}

@media (max-width: 600px) {
  .greeting-text {
    font-size: 22px;
  }
  .time {
    font-size: 52px;
  }
}
</style>
