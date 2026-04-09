<template>
  <router-link :to="`/e-dossier/${employee.id}`" class="employee-card card">
    <div class="card-body">
      <div class="ec-header">
        <div class="ec-avatar" :style="{ background: avatarGradient }">
          <img 
            :src="getThumbnailUrl(employee.id)" 
            :alt="employee.name"
            class="ec-avatar-img"
            loading="lazy"
            referrerpolicy="no-referrer"
            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
          />
          <span class="ec-avatar-fallback" style="display:none">{{ initials }}</span>
        </div>
        <div class="ec-info">
          <div class="ec-name">{{ employee.name }}</div>
          <div class="ec-id">ID: {{ employee.id }}</div>
        </div>
      </div>
      <div class="ec-details">
        <div class="ec-detail-row">
          <span class="ec-label">Unit</span>
          <span class="ec-value">{{ employee.unit }}</span>
        </div>
        <div class="ec-detail-row">
          <span class="ec-label">Position</span>
          <span class="ec-value">{{ employee.position }}</span>
        </div>
      </div>
      <div class="ec-progress">
        <div class="ec-progress-header">
          <span class="ec-progress-label">Document Completion</span>
          <span class="ec-progress-value" :class="progressColor">{{ stats.percentage }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-bar-fill" :style="{ width: stats.percentage + '%', background: progressGradient }"></div>
        </div>
        <div class="ec-doc-counts">
          <span class="count-complete">{{ stats.complete }} Complete</span>
          <span class="count-incomplete" v-if="stats.incomplete > 0">{{ stats.incomplete }} Incomplete</span>
        </div>
      </div>
    </div>
  </router-link>
</template>

<script setup>
import { computed } from 'vue'
import { useDossierStore } from '../stores/dossierStore'
import { getThumbnailUrl } from '../utils/thumbnail.js'

const props = defineProps({
  employee: { type: Object, required: true }
})

const store = useDossierStore()

const initials = computed(() => {
  return props.employee.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
})

const stats = computed(() => store.getEmployeeDocStats(props.employee.id))

const avatarColors = [
  'linear-gradient(135deg, #006297, #4d9bc4)',
  'linear-gradient(135deg, #006297, #4d9bc4)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #10b981, #6ee7b7)',
  'linear-gradient(135deg, #ef4444, #fca5a5)',
  'linear-gradient(135deg, #8b5cf6, #c4b5fd)',
  'linear-gradient(135deg, #ec4899, #f9a8d4)',
  'linear-gradient(135deg, #3b82f6, #93c5fd)'
]

const avatarGradient = computed(() => {
  const idx = parseInt(props.employee.id) % avatarColors.length
  return avatarColors[idx]
})

const progressColor = computed(() => {
  if (stats.value.percentage === 100) return 'text-success'
  if (stats.value.percentage >= 70) return 'text-warning'
  return 'text-danger'
})

const progressGradient = computed(() => {
  if (stats.value.percentage === 100) return 'linear-gradient(90deg, #10b981, #006297)'
  if (stats.value.percentage >= 70) return 'linear-gradient(90deg, #f59e0b, #fbbf24)'
  return 'linear-gradient(90deg, #ef4444, #f97316)'
})
</script>

<style scoped>
.employee-card {
  text-decoration: none;
  color: inherit;
  display: block;
  transition: transform 0.2s, box-shadow 0.2s;
}
.employee-card:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
}
.ec-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}
.ec-avatar {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
  overflow: hidden;
}
.ec-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 14px;
}
.ec-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.ec-name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}
.ec-id {
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-family: 'Courier New', monospace;
}
.ec-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border);
}
.ec-detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
}
.ec-label { color: var(--text-secondary); }
.ec-value { font-weight: 600; color: var(--text); }
.ec-progress-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.ec-progress-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.ec-progress-value {
  font-size: 0.85rem;
  font-weight: 800;
}
.text-success { color: #059669; }
.text-warning { color: #d97706; }
.text-danger  { color: #dc2626; }
.ec-doc-counts {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  font-size: 0.72rem;
  font-weight: 600;
}
.count-complete { color: #059669; }
.count-incomplete { color: #d97706; }
</style>
