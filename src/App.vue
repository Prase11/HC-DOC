<template>
  <ErrorBoundary>
    <router-view />
  </ErrorBoundary>
</template>

<script setup>
import { onMounted, watch } from 'vue'
import { useDossierStore } from './stores/dossierStore'
import { useAuthStore } from './stores/authStore'
import ErrorBoundary from './components/ErrorBoundary.vue'

const store = useDossierStore()
const authStore = useAuthStore()

// Only fetch dossier data if user is authenticated
onMounted(async () => {
  if (authStore.isAuthenticated) {
    await store.init()
  }
})

// Watch for authentication state changes (like after logging in)
watch(() => authStore.isAuthenticated, async (newVal) => {
  if (newVal) {
    await store.init()
  } else {
    // Optionally clear data on logout
    // store.$reset()
  }
})
</script>
