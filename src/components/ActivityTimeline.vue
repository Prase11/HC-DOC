<template>
  <div class="timeline">
    <div class="timeline-item" v-for="(item, i) in items" :key="i">
      <div class="timeline-marker">
        <div class="timeline-dot" :class="dotClass(item)">
          <!-- Upload -->
          <svg v-if="item.action?.toLowerCase().includes('upload')" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <!-- Updated -->
          <svg v-else-if="item.action?.toLowerCase().includes('update')" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
          <!-- Replace -->
          <svg v-else-if="item.action?.toLowerCase().includes('replace')" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          <!-- Delete -->
          <svg v-else-if="item.action?.toLowerCase().includes('delete')" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
          <!-- Unlock -->
          <svg v-else-if="item.action?.toLowerCase().includes('unlock')" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
          <!-- Default document -->
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        </div>
        <div class="timeline-line" v-if="i < items.length - 1"></div>
      </div>
      <div class="timeline-content">
        <div class="timeline-title">{{ item.action }}</div>
        <div class="timeline-meta">
          <span v-if="item.employee" class="timeline-employee">{{ item.employee }}</span>
          <span v-if="item.user" class="timeline-user">{{ item.user }}</span>
        </div>
        <div class="timeline-date">{{ formatDate(item.date) }}</div>
      </div>
    </div>
    <div v-if="!items.length" class="timeline-empty">No activity yet</div>
  </div>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})

function dotClass(item) {
  if (item.action?.toLowerCase().includes('upload')) return 'dot-success'
  if (item.action?.toLowerCase().includes('update')) return 'dot-info'
  if (item.action?.toLowerCase().includes('replace')) return 'dot-info'
  if (item.action?.toLowerCase().includes('delete')) return 'dot-danger'
  if (item.action?.toLowerCase().includes('unlock')) return 'dot-warning'
  return 'dot-default'
}

function formatDate(d) {
  if (!d) return ''
  const date = new Date(d)
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.timeline {
  display: flex;
  flex-direction: column;
}
.timeline-item {
  display: flex;
  gap: 14px;
  position: relative;
}
.timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 28px;
}
.timeline-dot {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  margin-top: 2px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dot-success { background: #d1fae5; color: #059669; }
.dot-info    { background: #dbeafe; color: #2563eb; }
.dot-danger  { background: #fee2e2; color: #dc2626; }
.dot-warning { background: #fef3c7; color: #d97706; }
.dot-default { background: #f1f5f9; color: #64748b; }

.timeline-line {
  width: 2px;
  flex: 1;
  background: var(--border);
  min-height: 20px;
}
.timeline-content {
  padding-bottom: 20px;
  flex: 1;
}
.timeline-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 2px;
}
.timeline-meta {
  display: flex;
  gap: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.timeline-employee { font-weight: 500; }
.timeline-user { opacity: .7; }
.timeline-user::before { content: '•'; margin-right: 8px; }
.timeline-date {
  font-size: 0.72rem;
  color: #94a3b8;
  margin-top: 2px;
}
.timeline-empty {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.85rem;
}
</style>
