<template>
  <div class="progress-card card">
    <div class="card-body">
      <div class="pc-header">
        <div class="pc-icon" :style="{ background: iconBg }">
          <span v-html="icon"></span>
        </div>
        <div class="pc-trend" v-if="trend" :class="trend > 0 ? 'trend-up' : 'trend-down'">
          <svg v-if="trend > 0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/></svg>
          <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/></svg>
          {{ Math.abs(trend) }}%
        </div>
      </div>
      <div class="pc-value">{{ displayValue }}</div>
      <div class="pc-label">{{ label }}</div>
      <div class="progress-bar" v-if="showProgress">
        <div class="progress-bar-fill" :style="{ width: percentage + '%' }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  value: { type: [Number, String], required: true },
  label: { type: String, required: true },
  icon: { type: String, default: '' },
  iconBg: { type: String, default: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
  trend: { type: Number, default: null },
  percentage: { type: Number, default: null },
  showProgress: { type: Boolean, default: false }
})

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString()
  }
  return props.value
})
</script>

<style scoped>
.progress-card {
  transition: transform 0.2s, box-shadow 0.2s;
}
.progress-card:hover {
  transform: translateY(-2px);
}
.pc-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 16px;
}
.pc-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}
.pc-trend {
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 0.75rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 50px;
}
.trend-up { color: #059669; background: #d1fae5; }
.trend-down { color: #dc2626; background: #fee2e2; }
.pc-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: var(--text);
  line-height: 1.2;
  margin-bottom: 4px;
}
.pc-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
  margin-bottom: 12px;
}
</style>
