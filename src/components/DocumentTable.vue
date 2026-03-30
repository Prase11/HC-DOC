<template>
  <div class="doc-table-wrap">
    <table class="data-table">
      <thead>
        <tr>
          <th>Document Name</th>
          <th>Status</th>
          <th style="text-align:right">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documents" :key="doc.name" :class="{ 'row-na': doc.status === 'optional' }">
          <td>
            <div class="doc-name-cell">
              <div class="doc-icon" :class="{ 'icon-na': doc.status === 'optional' }">
                <svg v-if="doc.status !== 'optional'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
              </div>
              <span :class="{ 'text-na': doc.status === 'optional' }">{{ doc.name }}</span>
            </div>
          </td>
          <td><StatusBadge :status="doc.status" /></td>
          <td style="text-align:right">
            <button class="btn btn-outline btn-sm" @click="$emit('detail', doc)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Detail
            </button>
          </td>
        </tr>
        <tr v-if="!documents.length">
          <td colspan="3" style="text-align:center; padding:24px; color:var(--text-secondary)">No documents in this category</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'

defineProps({
  documents: { type: Array, default: () => [] }
})
defineEmits(['detail'])
</script>

<style scoped>
.doc-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.doc-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}
.doc-icon {
  color: var(--primary);
  display: flex;
  align-items: center;
}
.doc-icon.icon-na { color: #94a3b8; }
.text-na { color: #94a3b8; text-decoration: line-through; }
.row-na { opacity: 0.6; }
</style>
