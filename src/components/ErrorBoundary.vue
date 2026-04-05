<template>
  <slot v-if="!hasError" />
  <div v-else class="error-boundary">
    <div class="error-boundary-content">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <h3>Something went wrong</h3>
      <p>{{ errorMessage }}</p>
      <button @click="resetError" class="error-retry-btn">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onErrorCaptured } from 'vue';

const hasError = ref(false);
const errorMessage = ref('');

onErrorCaptured((error) => {
    hasError.value = true;
    errorMessage.value = error.message || 'An unexpected error occurred.';
    console.error('[ErrorBoundary]', error);
    return false; // prevent further propagation
});

const resetError = () => {
    hasError.value = false;
    errorMessage.value = '';
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 40px;
}

.error-boundary-content {
  text-align: center;
  max-width: 400px;
}

.error-boundary-content h3 {
  margin: 16px 0 8px;
  font-size: 1.25rem;
  color: #1e293b;
  font-weight: 700;
}

.error-boundary-content p {
  color: #64748b;
  font-size: 0.9rem;
  margin-bottom: 20px;
}

.error-retry-btn {
  padding: 10px 24px;
  border-radius: 8px;
  background: #006297;
  color: white;
  border: none;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.error-retry-btn:hover {
  background: #3b6ce0;
  transform: translateY(-1px);
}
</style>
