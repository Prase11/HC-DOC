<template>
  <div class="app-layout">
    <!-- Mobile Sidebar Overlay -->
    <div class="sidebar-overlay" :class="{ active: mobileOpen }" @click="mobileOpen = false"></div>
    <SidebarNav :collapsed="sidebarCollapsed" :mobileOpen="mobileOpen" @toggle="sidebarCollapsed = !sidebarCollapsed" @open-settings="showSettings = true" @close-mobile="mobileOpen = false" />
    <div class="app-main" :class="{ collapsed: sidebarCollapsed }">
      <TopNavbar :sidebarCollapsed="sidebarCollapsed" @toggle-sidebar="handleToggleSidebar" />
      <div class="topbar-mask" :class="{ collapsed: sidebarCollapsed }"></div>
      <main class="app-content">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import SidebarNav from '../components/SidebarNav.vue'
import TopNavbar from '../components/TopNavbar.vue'
import { useDossierStore } from '../stores/dossierStore'

const sidebarCollapsed = ref(false)
const mobileOpen = ref(false)
const store = useDossierStore()

function handleToggleSidebar() {
  if (window.innerWidth <= 768) {
    mobileOpen.value = !mobileOpen.value
  } else {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }
}

</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.app-main {
  flex: 1;
  margin-left: var(--sidebar-width);
  transition: margin-left 0.3s cubic-bezier(.4,0,.2,1);
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
.app-main.collapsed {
  margin-left: var(--sidebar-collapsed-width);
}
.app-content {
  flex: 1;
  padding: 24px 28px;
  padding-top: calc(var(--topbar-height) + 24px);
}
.topbar-mask {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width);
  height: calc(var(--topbar-height) + 8px);
  background: transparent;
  z-index: 99;
  pointer-events: none;
  transition: left 0.3s cubic-bezier(.4,0,.2,1), background 0.3s;
}
.topbar-mask.collapsed {
  left: var(--sidebar-collapsed-width);
}

/* Mobile sidebar overlay backdrop */
.sidebar-overlay {
  display: none;
}

@media (max-width: 768px) {
  .app-main {
    margin-left: 0 !important;
  }
  .app-content {
    padding: 16px;
    padding-top: calc(var(--topbar-height) + 16px);
  }
  .topbar-mask {
    left: 0 !important;
  }
  .sidebar-overlay {
    display: block;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(2px);
    z-index: 99;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
  }
  .sidebar-overlay.active {
    opacity: 1;
    pointer-events: auto;
  }
}

@media (max-width: 480px) {
  .app-content {
    padding: 10px;
    padding-top: calc(var(--topbar-height) + 10px);
  }
}
</style>
