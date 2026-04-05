<template>
  <header class="topbar" :class="{ collapsed: sidebarCollapsed }">
    <div class="topbar-left">
      <button class="topbar-menu-btn" @click="$emit('toggle-sidebar')">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>
    </div>

    <div class="topbar-right">
      <!-- Dark mode toggle -->
      <button class="topbar-icon-btn" title="Toggle theme" @click="toggleDarkMode">
        <!-- Sun icon (shown in dark mode) -->
        <svg v-if="isDark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <!-- Moon icon (shown in light mode) -->
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      </button>

      <!-- Global Search -->
      <div class="global-search" ref="searchContainer">
        <div class="search-input-wrapper">
          <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input 
            type="text" 
            v-model="searchQuery" 
            @focus="showResults = true"
            @keyup.enter="handleEnter"
            placeholder="Search ID, Name, or Unit..." 
            class="topbar-search-input"
          />
          <div class="loader-spinner" v-if="isSearching"></div>
        </div>
        
        <!-- Search Results Dropdown -->
        <transition name="fade-slide">
          <div class="search-dropdown" v-if="showResults && searchQuery.length > 0">
            <div v-if="isSearching && searchResults.length === 0" class="search-message">Searching for "{{ searchQuery }}"...</div>
            <div v-else-if="searchResults.length === 0" class="search-message">No employees found.</div>
            <div v-else class="search-results-list">
              <div 
                class="search-result-item" 
                v-for="emp in searchResults" 
                :key="emp.employee_id"
                @click="goToEmployee(emp.employee_id)"
              >
                <div class="result-avatar">
                  <img 
                    :src="`https://api-myhc.gmf-aeroasia.co.id/thumbnail/${emp.employee_id}.jpg`" 
                    :alt="emp.name"
                    class="result-avatar-img"
                    @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                  />
                  <span class="result-avatar-fallback" style="display:none">{{ emp.name.charAt(0) }}</span>
                </div>
                <div class="result-info-box">
                  <div class="result-name">{{ emp.name }}</div>
                  <div class="result-meta">
                    <span class="result-id">{{ emp.employee_id }}</span>
                    <span class="result-dot">·</span>
                    <span>{{ emp.unit || 'No Unit' }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </transition>
      </div>

      <!-- User Profile & Logout -->
      <div class="topbar-user">
        <div class="user-info">
          <span class="user-name">{{ authStore.user?.name || 'User' }}</span>
        </div>
        <div class="user-avatar">
          <img 
            v-if="authStore.user?.employee_id"
            :src="`https://api-myhc.gmf-aeroasia.co.id/thumbnail/${authStore.user.employee_id}.jpg`" 
            :alt="authStore.user?.name || 'User'"
            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
          />
          <span class="user-avatar-fallback" :style="authStore.user?.employee_id ? 'display:none' : ''">{{ (authStore.user?.name || 'U').charAt(0) }}</span>
        </div>
      </div>
      
      <button class="topbar-icon-btn text-danger ml-2" @click="handleLogout" title="Logout">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { apiFetch } from '../utils/api'

defineProps({
  sidebarCollapsed: { type: Boolean, default: false }
})
defineEmits(['toggle-sidebar'])

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isDark = ref(false)

// ── Search Logic ──
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)
const showResults = ref(false)
let searchTimeout = null

watch(searchQuery, (newVal) => {
  clearTimeout(searchTimeout)
  if (!newVal.trim()) {
    searchResults.value = []
    isSearching.value = false
    return
  }
  isSearching.value = true
  searchTimeout = setTimeout(async () => {
    try {
      const res = await apiFetch(`/api/employees/search?q=${encodeURIComponent(newVal.trim())}`)
      const json = await res.json()
      if (json.success) {
        searchResults.value = json.data
      }
    } catch (e) {
      console.error('Search error', e)
    } finally {
      isSearching.value = false
    }
  }, 400) // 400ms debounce
})

function handleBlur() {
  // Give time for click event on custom element to fire before hiding results
  setTimeout(() => {
    showResults.value = false
  }, 200)
}

function handleEnter() {
  const query = searchQuery.value.trim()
  if (!query) return

  if (searchResults.value && searchResults.value.length > 0) {
    const qLower = query.toLowerCase()
    const exactMatch = searchResults.value.find(emp => String(emp.employee_id).toLowerCase() === qLower)
    const target = exactMatch || searchResults.value[0]
    goToEmployee(target.employee_id)
  } else {
    // If no results yet (e.g. typed too fast), try to go to the ID directly
    goToEmployee(query)
  }
}

function goToEmployee(id) {
  showResults.value = false
  searchQuery.value = ''
  router.push(`/e-dossier/${id}`)
}

const pageTitle = computed(() => {
  const path = route.path
  if (path === '/dashboard') return 'Dashboard'
  if (path.startsWith('/e-dossier')) return 'E-Dossier'
  if (path === '/reporting') return 'Reporting'
  if (path === '/admin') return 'Admin'
  return 'Dashboard'
})

function toggleDarkMode() {
  document.documentElement.classList.add('theme-transition')
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
  localStorage.setItem('hc-dark-mode', isDark.value ? 'true' : 'false')
  setTimeout(() => {
    document.documentElement.classList.remove('theme-transition')
  }, 500)
}

onMounted(() => {
  const saved = localStorage.getItem('hc-dark-mode')
  if (saved === 'true') {
    isDark.value = true
    document.documentElement.classList.add('dark')
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.topbar {
  position: fixed;
  top: 12px;
  right: 28px;
  left: calc(var(--sidebar-width) + 28px);
  height: calc(var(--topbar-height) - 12px);
  background: var(--surface);
  border: none;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 22px;
  z-index: 100;
  transition: left 0.3s cubic-bezier(.4,0,.2,1), background 0.3s;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
}
.topbar.collapsed {
  left: calc(var(--sidebar-collapsed-width) + 28px);
}

/* ── Left ──────────────────────────── */
.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.topbar-menu-btn {
  display: none;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 8px;
}
.topbar-menu-btn:hover { background: var(--surface-variant); }

.page-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  white-space: nowrap;
}
.title-divider {
  width: 1px;
  height: 24px;
  background: var(--border);
  flex-shrink: 0;
}

/* ── Left: Company ─────────────────── */
.topbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
}
.company-logo {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.company-info {
  display: flex;
  flex-direction: column;
}
.company-name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
  letter-spacing: -0.01em;
}
.company-sub {
  font-size: 0.65rem;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
  text-transform: uppercase;
  font-weight: 500;
}

/* ── Right ─────────────────────────── */
.topbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-icon-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  background: transparent;
  border-radius: 50%;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
}
.topbar-icon-btn:hover {
  background: var(--surface-variant);
  color: var(--primary);
}
.notification-badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ef4444;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 700;
  border-radius: 50px;
  padding: 0 4px;
  border: 2px solid var(--surface);
  line-height: 1;
}

/* ── Global Search ─────────────────── */
.global-search {
  position: relative;
  margin-right: 8px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-secondary);
  pointer-events: none;
}

.topbar-search-input {
  width: 260px;
  height: 38px;
  background: var(--surface-variant);
  border: 1px solid transparent;
  border-radius: 50px;
  padding: 0 16px 0 36px;
  font-size: 0.85rem;
  color: var(--text);
  outline: none;
  font-family: inherit;
  transition: all 0.3s ease;
}

.topbar-search-input:focus {
  background: var(--surface);
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(0, 98, 151, 0.1);
  width: 320px;
}

.loader-spinner {
  position: absolute;
  right: 14px;
  width: 14px;
  height: 14px;
  border: 2px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.search-dropdown {
  position: absolute;
  top: calc(100% + 10px);
  left: 0;
  width: 100%;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 1000;
}

.fade-slide-enter-active, .fade-slide-leave-active {
  transition: opacity 0.2s, transform 0.2s;
}
.fade-slide-enter-from, .fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

.search-message {
  padding: 16px 20px;
  text-align: center;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.search-results-list {
  max-height: 400px;
  overflow-y: auto;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border);
  transition: background 0.2s;
}

.search-result-item:last-child {
  border-bottom: none;
}

.search-result-item:hover {
  background: var(--surface-variant);
}

.result-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.result-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.result-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.result-info-box {
  display: flex;
  flex-direction: column;
}

.result-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}

.result-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.result-id {
  font-weight: 600;
  color: var(--primary);
  font-family: monospace;
}

.result-dot {
  color: var(--border);
}

/* ── User Profile ──────────────────── */
.topbar-user {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 4px 10px 4px 4px;
  border-radius: 50px;
  cursor: pointer;
  transition: background 0.2s;
  margin-left: 6px;
}
.topbar-user:hover { background: var(--surface-variant); }
.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid var(--border);
  flex-shrink: 0;
  background: var(--surface-variant);
}
.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.user-avatar-fallback {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #006297, #4d9bc4);
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
}
.user-info {
  display: flex;
  flex-direction: column;
}
.user-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  line-height: 1.2;
}
.user-role {
  font-size: 0.7rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 768px) {
  .topbar { left: 16px !important; right: 16px !important; }
  .topbar.collapsed { left: 16px !important; }
  .topbar-menu-btn { display: flex; }
  .page-title { display: none; }
  .title-divider { display: none; }
  .user-info { display: none; }
  .topbar-search-input {
    width: 140px;
  }
  .topbar-search-input:focus {
    width: 180px;
  }
  .search-dropdown {
    width: calc(100vw - 40px);
    max-width: 380px;
    left: auto;
    right: -60px;
  }
  .topbar-right {
    gap: 6px;
  }
  .global-search {
    margin-right: 0;
  }
  .topbar-user {
    margin-left: 0;
    padding: 4px;
  }
}

@media (max-width: 480px) {
  .topbar {
    padding: 0 12px;
  }
  .topbar-search-input {
    width: 110px;
  }
  .topbar-search-input:focus {
    width: 140px;
  }
  .topbar-icon-btn {
    width: 32px;
    height: 32px;
  }
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  .search-dropdown {
    left: auto;
    right: -30px;
  }
}

@media (max-width: 380px) {
  .topbar {
    padding: 0 8px;
    border-radius: 8px;
    top: 4px;
    right: 6px;
    left: 6px;
    height: calc(var(--topbar-height) - 12px);
  }
  .topbar-right {
    gap: 2px;
  }
  .topbar-search-input {
    width: 80px;
    height: 32px;
    font-size: 0.78rem;
    padding: 0 10px 0 30px;
  }
  .topbar-search-input:focus {
    width: 110px;
  }
  .topbar-icon-btn {
    width: 28px;
    height: 28px;
  }
  .topbar-icon-btn svg {
    width: 14px;
    height: 14px;
  }
  .topbar-user {
    padding: 2px;
  }
  .user-avatar {
    width: 28px;
    height: 28px;
  }
  .topbar-menu-btn {
    width: 32px;
    height: 32px;
  }
  .search-dropdown {
    position: fixed;
    left: 8px;
    right: 8px;
    width: auto;
    max-width: none;
  }
}
</style>
