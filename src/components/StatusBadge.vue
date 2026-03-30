<template>
  <span class="status-badge" :class="badgeClass">
    <span class="status-dot"></span>
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  status: { type: String, required: true }
})

const badgeClass = computed(() => {
  switch (props.status) {
    case 'complete': return 'badge-success'
    case 'incomplete': return 'badge-warning'
    case 'optional': return 'badge-secondary'
    case 'active': return 'badge-success'
    case 'disabled': return 'badge-danger'
    default: return 'badge-secondary'
  }
})

const label = computed(() => {
  switch (props.status) {
    case 'complete': return 'Complete'
    case 'incomplete': return 'Incomplete'
    case 'optional': return 'N/A'
    case 'active': return 'Active'
    case 'disabled': return 'Disabled'
    default: return props.status
  }
})
</script>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}
.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}
.badge-success { background: #d1fae5; color: #065f46; }
.badge-success .status-dot { background: #10b981; }
.badge-warning { background: #fef3c7; color: #92400e; }
.badge-warning .status-dot { background: #f59e0b; }
.badge-secondary { background: #f1f5f9; color: #64748b; }
.badge-secondary .status-dot { background: #94a3b8; }
.badge-danger { background: #fee2e2; color: #991b1b; }
.badge-danger .status-dot { background: #ef4444; }
</style>
