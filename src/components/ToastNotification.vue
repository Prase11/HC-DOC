<template>
  <Teleport to="body">
    <div class="toast-stack">
      <TransitionGroup name="toast-slide">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast-item"
          :class="`toast-${toast.type}`"
          @click="remove(toast.id)"
        >
          <!-- Success -->
          <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <!-- Error -->
          <svg v-else-if="toast.type === 'error'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <!-- Warning -->
          <svg v-else-if="toast.type === 'warning'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          <!-- Info -->
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>

          <span class="toast-msg">{{ toast.message }}</span>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from '../composables/useToast'
const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-stack {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 18px;
  border-radius: 10px;
  font-size: 0.875rem;
  font-weight: 600;
  min-width: 260px;
  max-width: 380px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  cursor: pointer;
  pointer-events: auto;
  color: #fff;
}

.toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); }
.toast-error   { background: linear-gradient(135deg, #ef4444, #dc2626); }
.toast-warning { background: linear-gradient(135deg, #f59e0b, #d97706); }
.toast-info    { background: linear-gradient(135deg, #006297, #004a73); }

.toast-msg { flex: 1; line-height: 1.4; }

.toast-slide-enter-active { transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.toast-slide-leave-active { transition: all 0.2s ease; }
.toast-slide-enter-from   { opacity: 0; transform: translateX(60px); }
.toast-slide-leave-to     { opacity: 0; transform: translateX(60px); }

@media (max-width: 480px) {
  .toast-stack {
    bottom: 16px;
    right: 16px;
    left: 16px;
  }
  .toast-item {
    min-width: unset;
    max-width: 100%;
  }
}
</style>
