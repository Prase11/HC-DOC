<template>
  <aside class="sidebar" :class="{ collapsed, 'mobile-open': mobileOpen }">
    <!-- Brand -->
    <div class="sidebar-brand">
      <div class="brand-icon">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Background with gradient -->
          <defs>
            <linearGradient id="logoGrad" x1="0" y1="0" x2="36" y2="36">
              <stop offset="0%" stop-color="#0ea5e9"/>
              <stop offset="100%" stop-color="#06b6d4"/>
            </linearGradient>
            <linearGradient id="badgeGrad" x1="22" y1="20" x2="30" y2="28">
              <stop offset="0%" stop-color="#22c55e"/>
              <stop offset="100%" stop-color="#10b981"/>
            </linearGradient>
          </defs>
          <!-- Rounded square bg -->
          <rect width="36" height="36" rx="10" fill="url(#logoGrad)"/>
          <!-- Document shape with folded corner -->
          <path d="M10 7h10l6 6v16a2 2 0 01-2 2H10a2 2 0 01-2-2V9a2 2 0 012-2z" fill="white" fill-opacity="0.95"/>
          <path d="M20 7l6 6h-4a2 2 0 01-2-2V7z" fill="#0ea5e9" fill-opacity="0.3"/>
          <!-- Document lines -->
          <line x1="12" y1="16" x2="22" y2="16" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round"/>
          <line x1="12" y1="20" x2="20" y2="20" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.6"/>
          <line x1="12" y1="24" x2="18" y2="24" stroke="#0ea5e9" stroke-width="1.5" stroke-linecap="round" stroke-opacity="0.4"/>
          <!-- Check badge -->
          <circle cx="26" cy="25" r="6" fill="url(#badgeGrad)" stroke="white" stroke-width="1.5"/>
          <path d="M23.5 25l1.5 1.5 3-3" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <transition name="fade">
        <span v-if="!collapsed" class="brand-text">HC DOC</span>
      </transition>
    </div>

    <!-- Navigation -->
    <nav class="sidebar-nav">
      <router-link
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        class="nav-item"
        :class="{ active: isActive(item) }"
        @click="handleNavClick"
      >
        <span class="nav-icon">
          <!-- Dashboard -->
          <svg v-if="item.icon === 'dashboard'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
          <!-- Employee -->
          <svg v-else-if="item.icon === 'employees'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
          <!-- Reporting -->
          <svg v-else-if="item.icon === 'reporting'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
          <!-- Admin -->
          <svg v-else-if="item.icon === 'admin'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        <transition name="fade">
          <span v-if="!collapsed" class="nav-label">{{ item.label }}</span>
        </transition>
        <transition name="fade">
          <svg v-if="!collapsed && item.hasDropdown" class="nav-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
        </transition>
      </router-link>
    </nav>

    <!-- Collapse toggle -->
    <button class="sidebar-toggle" @click="$emit('toggle')" :title="collapsed ? 'Expand' : 'Collapse'">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path v-if="!collapsed" d="M15 18l-6-6 6-6"/>
        <path v-else d="M9 18l6-6-6-6"/>
      </svg>
    </button>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

defineProps({
  collapsed: Boolean,
  mobileOpen: Boolean
})
const emit = defineEmits(['toggle', 'open-settings', 'close-mobile'])

function handleNavClick() {
  if (window.innerWidth <= 768) {
    emit('close-mobile')
  }
}

const route = useRoute()
const authStore = useAuthStore()

const allNavItems = [
  {
    label: 'Dashboards',
    to: '/dashboard',
    icon: 'dashboard',
    hasDropdown: true
  },
  {
    label: 'Employee E-Dossier',
    to: '/e-dossier',
    icon: 'employees',
    hasDropdown: false
  },
  {
    label: 'Reporting',
    to: '/reporting',
    icon: 'reporting',
    hasDropdown: false
  },
  {
    label: 'Admin',
    to: '/admin',
    icon: 'admin',
    hasDropdown: false,
    superAdminOnly: true
  }
]

// Only show superAdminOnly items if user is Super Admin
const navItems = computed(() =>
  allNavItems.filter(item => !item.superAdminOnly || authStore.isSuperAdmin)
)

function isActive(item) {
  if (item.to === '/e-dossier') {
    return route.path.startsWith('/e-dossier')
  }
  return route.path === item.to
}
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--surface);
  color: var(--text);
  display: flex;
  flex-direction: column;
  z-index: 100;
  transition: width 0.3s cubic-bezier(.4,0,.2,1), background 0.3s, color 0.3s;
  overflow: hidden;
  border-right: 1px solid var(--border);
  box-shadow: none;
}
.sidebar.collapsed {
  width: var(--sidebar-collapsed-width);
}

/* ── Brand ─────────────────────────── */
.sidebar-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 18px 20px;
  border-bottom: 1px solid var(--border);
  min-height: 64px;
  background: var(--surface);
}
.brand-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}
.brand-text {
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--text);
  white-space: nowrap;
  letter-spacing: 0.02em;
}
.brand-settings {
  margin-left: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;
}
.brand-settings:hover {
  background: var(--surface-variant);
  color: var(--text);
}

/* ── Navigation ────────────────────── */
.sidebar-nav {
  flex: 1;
  padding: 20px 14px;
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 16px;
  border-radius: 8px;
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
  white-space: nowrap;
  position: relative;
}
.nav-item:hover {
  background: var(--surface-variant);
  color: var(--text);
  transform: translateX(4px);
}
.nav-item.active {
  background: #0ea5e9;
  color: #ffffff;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(14,165,233,.3);
}

/* ── Nav Icon ──────────────────────── */
.nav-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--text-secondary);
  transition: color 0.2s;
}
.nav-item:hover .nav-icon {
  color: var(--text);
}
.nav-item.active .nav-icon {
  color: #ffffff;
}

.nav-label {
  white-space: nowrap;
  flex: 1;
}
.nav-chevron {
  margin-left: auto;
  opacity: 0.5;
  flex-shrink: 0;
}
.nav-item.active .nav-chevron {
  opacity: 0.8;
}

/* ── Toggle button ─────────────────── */
.sidebar-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 14px;
  border: none;
  background: var(--surface-variant);
  color: var(--text-secondary);
  cursor: pointer;
  border-top: 1px solid var(--border);
  transition: all 0.2s;
}
.sidebar-toggle:hover {
  background: var(--border);
  color: var(--text);
}

/* ── Transitions ───────────────────── */
.fade-enter-active { transition: opacity .2s; }
.fade-leave-active { transition: opacity .15s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
    box-shadow: none;
    width: var(--sidebar-width) !important;
  }
  .sidebar.mobile-open {
    transform: translateX(0);
    box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
  }
  .sidebar-toggle {
    display: none;
  }
}
</style>
