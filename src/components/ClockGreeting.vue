<template>
  <div class="clock-greeting">
    <div class="greeting-text">{{ greeting }}</div>
    <div class="time-display">
      <span class="time">{{ time }}</span>
      <span class="date">{{ date }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClockGreeting',
  props: {
    nickname: { type: String, default: '' },
  },
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

      // 问候语
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
}

.greeting-text {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.time-display {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 16px;
}

.time {
  font-size: 48px;
  font-weight: 200;
  color: var(--text-primary);
  font-variant-numeric: tabular-nums;
  letter-spacing: 2px;
}

.date {
  font-size: 14px;
  color: var(--text-muted);
}

@media (max-width: 600px) {
  .greeting-text {
    font-size: 22px;
  }
  .time {
    font-size: 36px;
  }
}
</style>
