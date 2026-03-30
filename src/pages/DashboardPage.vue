<template>
  <div class="dashboard-page">
    <div class="page-header">
      <h1 class="page-title">Dashboard</h1>
      <nav class="breadcrumb">
        <span class="breadcrumb-item breadcrumb-home breadcrumb-current">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Dashboard
        </span>
      </nav>
      <p class="page-subtitle">Overview of employee document management</p>
    </div>

    <div class="dashboard-layout">
      <!-- ═══ Left / Main Content ═══ -->
      <div class="dashboard-main">
        <!-- Statistics Card -->
        <div class="card stats-card">
          <div class="card-body">
            <div class="stats-header">
              <h3 class="section-title">Statistics</h3>
              <span class="stats-updated">Updated just now</span>
            </div>
            <div class="stats-row">
              <div class="stat-item">
                <div class="stat-icon stat-icon-primary">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ stats.totalEmployees }}</span>
                  <span class="stat-label">Total Active Employees</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon stat-icon-success">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ stats.employeesComplete }}</span>
                  <span class="stat-label">Complete Employees</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon stat-icon-warning">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="18" y1="8" x2="23" y2="13"/><line x1="23" y1="8" x2="18" y2="13"/></svg>
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ stats.employeesIncomplete }}</span>
                  <span class="stat-label">Incomplete Employees</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon stat-icon-primary">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ stats.totalComplete }}</span>
                  <span class="stat-label">Completed Document</span>
                </div>
              </div>
              <div class="stat-divider"></div>
              <div class="stat-item">
                <div class="stat-icon stat-icon-warning">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                </div>
                <div class="stat-data">
                  <span class="stat-value">{{ stats.totalIncomplete }}</span>
                  <span class="stat-label">Incomplete Document</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Employee with Incomplete Document -->
        <div class="card">
          <div class="card-body">
            <h3 class="section-title">Employee with Incomplete Document</h3>
            <div class="doc-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Number of Missing Docs</th>
                    <th>Incomplete Docs</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in paginatedIncomplete" :key="row.id">
                    <td><span class="emp-id-mono">{{ row.id }}</span></td>
                    <td><span class="emp-name-link">{{ row.name }}</span></td>
                    <td><span class="missing-count">{{ row.missingCount }}</span></td>
                    <td><span class="missing-list">{{ row.missingDocs }}</span></td>
                  </tr>
                  <tr v-if="!paginatedIncomplete.length">
                    <td colspan="4" style="text-align:center;padding:24px;color:var(--text-secondary)">All documents are complete!</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <!-- Pagination -->
            <div class="pagination" v-if="totalPages > 1">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <button
                v-for="p in displayPages"
                :key="p"
                class="page-btn"
                :class="{ active: p === currentPage, ellipsis: p === '...' }"
                :disabled="p === '...'"
                @click="p !== '...' && (currentPage = p)"
              >{{ p }}</button>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>

        <!-- Top Most Missing Document -->
        <div class="card">
          <div class="card-body">
            <h3 class="section-title">Top Most Missing Document</h3>
            <div class="missing-chart">
              <div class="missing-bar-row" v-for="(item, i) in topMissingDocs" :key="i">
                <span class="missing-rank">{{ i + 1 }}.</span>
                <span class="missing-doc-name">{{ item.name }}</span>
                <div class="missing-bar-track">
                  <div class="missing-bar-fill" :style="{ width: item.percent + '%' }"></div>
                </div>
                <span class="missing-bar-value">{{ item.count }} Employees</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═══ Right Sidebar ═══ -->
      <div class="dashboard-sidebar">
        <!-- Profile Completeness Doughnut -->
        <div class="card">
          <div class="card-body">
            <h3 class="section-title" style="text-align:center">Employee Profile Completeness</h3>
            <div class="chart-container-sm">
              <Doughnut :data="doughnutData" :options="doughnutOptions" />
              <div class="doughnut-center-label">
                <span class="center-pct">{{ Number(stats.completionPercentage).toFixed(2).replace(/\.00$/, '') }}%</span>
              </div>
            </div>
            <div class="completeness-legend">
              <div class="legend-item">
                <div class="legend-bar" style="background:#0d9488"></div>
                <div>
                  <span class="legend-label">Complete</span>
                  <span class="legend-value">{{ Number(stats.completionPercentage).toFixed(2).replace(/\.00$/, '') }}%</span>
                </div>
              </div>
              <div class="legend-item">
                <div class="legend-bar" style="background:#38bdf8"></div>
                <div>
                  <span class="legend-label">Incomplete</span>
                  <span class="legend-value">{{ Number(100 - stats.completionPercentage).toFixed(2).replace(/\.00$/, '') }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Recent Activities (Audit Trail) -->
        <div class="card">
          <div class="card-body">
            <h3 class="section-title">Audit Trail (Recent Activities)</h3>
            <div class="sidebar-activity">
              <div class="activity-item" v-for="act in store.recentActivity.slice(0, 10)" :key="act.id">
                <div class="activity-avatar" :class="activityColor(act)">
                  <!-- Upload -->
                  <svg v-if="act.action.includes('Upload')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <!-- Updated -->
                  <svg v-else-if="act.action.includes('Updated')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  <!-- Replace -->
                  <svg v-else-if="act.action.includes('Replace')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
                  <!-- Delete -->
                  <svg v-else-if="act.action.includes('Delete')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  <!-- Unlocked -->
                  <svg v-else-if="act.action.includes('Unlock')" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
                  <!-- Default document -->
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div class="activity-info">
                  <div class="activity-text">
                    <span class="activity-emp-id">{{ act.employeeId }}</span>
                    {{ act.action }}
                    <span class="activity-doc-id">{{ act.document }}</span>
                  </div>
                  <div class="activity-meta">
                    <div class="activity-meta-row">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      <span class="activity-user">{{ act.user }}</span>
                    </div>
                    <div class="activity-meta-row">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                      <span class="activity-time" :title="formatFullDate(act.date)">{{ formatTimeAgo(act.date) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <span>COPYRIGHT © 2025 <strong>HR E-Dossier System</strong></span>
      <span>Hand-crafted & Made with ❤️</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Doughnut } from 'vue-chartjs'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js'
import { useDossierStore } from '../stores/dossierStore'

ChartJS.register(ArcElement, Tooltip, Legend)

const store = useDossierStore()
const stats = computed(() => store.globalStats)

const currentPage = ref(1)
const pageSize = 5

onMounted(async () => {
  await Promise.all([
    store.fetchDashboardStats(),
    store.fetchMissingReport({ status: 'incomplete', page: 1, limit: pageSize, format: 'grouped' }),
    store.fetchActivities()
  ])
})

// ── Incomplete employees table (now server-side paginated) ──
const paginatedIncomplete = computed(() => store.backendMissingReport)
const totalPages = computed(() => store.backendMissingPagination.totalPages || 1)
const totalIncompleteEmployees = computed(() => store.backendMissingPagination.total || 0)

const displayPages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const pages = []
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

// Watch page changes to fetch new data from server
watch(currentPage, async (newPage) => {
  await store.fetchMissingReport({ status: 'incomplete', page: newPage, limit: pageSize, format: 'grouped' })
})

async function goToPage(p) {
  if (p === '...' || p === currentPage.value) return
  currentPage.value = p
}

async function prevPage() {
  if (currentPage.value > 1) currentPage.value--
}

async function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++
}

// ── Top missing documents horizontal bar chart (from server) ──
const topMissingDocs = computed(() => {
  const docs = store.backendTopMissingDocs || []
  const max = docs.length ? docs[0].count : 1
  return docs.map(s => ({ ...s, percent: (s.count / max) * 100 }))
})

// ── Doughnut chart ──────────────────────────────────
const doughnutData = computed(() => ({
  labels: ['Complete', 'Incomplete'],
  datasets: [{
    data: [stats.value.totalComplete || 0, stats.value.totalIncomplete || 1],
    backgroundColor: ['#0d9488', '#38bdf8'],
    borderWidth: 3,
    borderColor: '#ffffff',
    hoverOffset: 6
  }]
}))

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '68%',
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx) => {
          const total = stats.value.totalDocs || 1
          const val = ctx.raw
          const pct = ((val / total) * 100).toFixed(2).replace(/\.00$/, '')
          return `${ctx.label}: ${val.toLocaleString()} (${pct}%)`
        }
      }
    }
  }
}

// ── Helpers ─────────────────────────────────────────
function activityColor(act) {
  if (act.action.includes('Upload')) return 'av-success'
  if (act.action.includes('Replace')) return 'av-info'
  if (act.action.includes('Delete')) return 'av-danger'
  return 'av-default'
}

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const now = new Date()
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const diffMs = now - d
  const diffMin = Math.floor(diffMs / (1000 * 60))
  const diffHour = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDay = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  if (diffDay === 0) return 'Today'
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 7) return `${diffDay} days ago`
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`
  // Show actual date for older activities
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatFullDate(dateStr) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return String(dateStr)
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des']
  const day = d.getDate().toString().padStart(2, '0')
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = d.getHours().toString().padStart(2, '0')
  const mins = d.getMinutes().toString().padStart(2, '0')
  
  return `${day} ${month} ${year}, ${hours}:${mins}`
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text); }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin-top: 2px; }

/* ── 2-column layout ───────────────────────────── */
.dashboard-layout {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  align-items: start;
}
.dashboard-main {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.dashboard-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ── Stats card ────────────────────────────────── */
.stats-card .stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}
.stats-updated {
  font-size: 0.78rem;
  color: var(--text-secondary);
}
.stats-row {
  display: flex;
  align-items: center;
  gap: 0;
}
.stat-item {
  display: flex;
  align-items: center;
  gap: 14px;
  flex: 1;
  padding: 0 16px;
}
.stat-divider {
  width: 1px;
  height: 48px;
  background: var(--border);
  flex-shrink: 0;
}
.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon-primary { background: rgba(14,165,233,.12); color: #0ea5e9; }
.stat-icon-success { background: rgba(16,185,129,.12); color: #10b981; }
.stat-icon-warning { background: rgba(245,158,11,.12); color: #f59e0b; }
.stat-data { display: flex; flex-direction: column; }
.stat-value { font-size: 1.5rem; font-weight: 800; color: var(--text); line-height: 1.2; }
.stat-label { font-size: 0.78rem; color: var(--text-secondary); font-weight: 500; }

/* ── Section title ─────────────────────────────── */
.section-title { font-size: 1rem; font-weight: 700; color: var(--text); margin-bottom: 16px; }

/* ── Table ─────────────────────────────────────── */
.doc-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}
.emp-id-mono { font-family: 'Courier New', monospace; font-weight: 600; color: var(--text); }
.emp-name-link { font-weight: 600; color: var(--text); }
.missing-count {
  display: inline-flex; align-items: center; justify-content: center;
  width: 28px; height: 28px; border-radius: 50%;
  background: rgba(245,158,11,.12); color: #d97706;
  font-weight: 700; font-size: 0.85rem;
}
.missing-list { font-size: 0.82rem; color: var(--text-secondary); }

/* ── Pagination ────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
}
.page-btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 34px; height: 34px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.85rem; font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 6px;
}
.page-btn:hover:not(:disabled):not(.active) { background: var(--surface-variant); color: var(--text); }
.page-btn.active {
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: #fff; border-color: #0ea5e9;
}
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn.ellipsis { border: none; cursor: default; }

/* ── Missing docs bar chart ────────────────────── */
.missing-chart { display: flex; flex-direction: column; gap: 14px; }
.missing-bar-row {
  display: flex; align-items: center; gap: 10px;
}
.missing-rank { font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); width: 20px; text-align: right; }
.missing-doc-name { font-size: 0.85rem; font-weight: 600; color: var(--text); width: 120px; flex-shrink: 0; }
.missing-bar-track { flex: 1; height: 18px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
.missing-bar-fill { height: 100%; background: linear-gradient(90deg, #0ea5e9, #38bdf8); border-radius: 4px; transition: width .6s ease; }
.missing-bar-value { font-size: 0.78rem; font-weight: 600; color: var(--text-secondary); width: 100px; text-align: right; white-space: nowrap; }

/* ── Right sidebar doughnut ────────────────────── */
.chart-container-sm { height: 200px; position: relative; margin-bottom: 16px; }
.doughnut-center-label {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}
.center-pct {
  font-size: 1.6rem;
  font-weight: 800;
  color: #0d9488;
}
.completeness-legend {
  display: flex; gap: 24px; justify-content: center;
}
.legend-item {
  display: flex; align-items: center; gap: 8px;
}
.legend-bar { width: 28px; height: 8px; border-radius: 4px; flex-shrink: 0; }
.legend-label { font-size: 0.78rem; color: var(--text-secondary); display: block; }
.legend-value { font-size: 0.9rem; font-weight: 700; color: var(--text); }

/* ── Activity sidebar ──────────────────────────── */
.sidebar-activity { display: flex; flex-direction: column; gap: 14px; }
.activity-item { display: flex; gap: 10px; align-items: flex-start; }
.activity-avatar {
  width: 32px; height: 32px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.av-success { background: #d1fae5; color: #059669; }
.av-info    { background: #dbeafe; color: #2563eb; }
.av-danger  { background: #fee2e2; color: #dc2626; }
.av-default { background: #f1f5f9; color: #64748b; }
.activity-info { flex: 1; min-width: 0; }
.activity-text { font-size: 0.8rem; color: var(--text); line-height: 1.4; word-wrap: break-word; }
.activity-emp-id { font-weight: 700; color: #0ea5e9; }
.activity-doc-id { font-weight: 700; color: var(--text); }
.activity-meta { display: flex; flex-direction: column; gap: 4px; margin-top: 6px; }
.activity-meta-row { display: flex; align-items: center; gap: 6px; color: #64748b; }
.activity-user { font-size: 0.75rem; font-weight: 600; }
.activity-time { font-size: 0.72rem; }

/* ── Footer ────────────────────────────────────── */
.dashboard-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  margin-top: 32px;
  border-top: 1px solid var(--border);
  font-size: 0.78rem;
  color: var(--text-secondary);
}

@media (max-width: 1024px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .missing-doc-name { width: auto; min-width: 80px; }
}

@media (max-width: 768px) {
  .dashboard-layout { grid-template-columns: 1fr; }
  .stats-row { flex-direction: column; gap: 16px; }
  .stat-divider { width: 100%; height: 1px; }
  .stat-item { padding: 0; }
  .stat-value { font-size: 1.2rem; }
  .stat-icon { width: 40px; height: 40px; }
  .missing-bar-row { flex-wrap: wrap; gap: 6px; }
  .missing-doc-name { width: auto; min-width: 60px; font-size: 0.78rem; }
  .missing-bar-value { width: auto; font-size: 0.72rem; text-align: left; }
  .missing-rank { width: 16px; font-size: 0.75rem; }
  .dashboard-footer {
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  .page-title { font-size: 1.25rem; }

}

@media (max-width: 480px) {
  .page-title { font-size: 1.1rem; }
  .page-subtitle { font-size: 0.78rem; }
  .section-title { font-size: 0.88rem; margin-bottom: 12px; }

  .stats-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
  .stat-divider { display: none; }
  .stat-item {
    padding: 0;
    gap: 10px;
  }
  .stat-icon {
    width: 36px;
    height: 36px;
  }
  .stat-icon svg {
    width: 18px;
    height: 18px;
  }
  .stat-value { font-size: 1rem; }
  .stat-label { font-size: 0.7rem; }

  /* Missing chart: stack label above bar */
  .missing-bar-row {
    flex-wrap: wrap;
    gap: 4px;
  }
  .missing-rank { width: 18px; font-size: 0.72rem; }
  .missing-doc-name {
    width: calc(100% - 26px);
    min-width: unset;
    font-size: 0.78rem;
  }
  .missing-bar-track {
    width: 100%;
    order: 3;
  }
  .missing-bar-value {
    width: 100%;
    text-align: left;
    font-size: 0.7rem;
    order: 4;
  }

  /* Doughnut chart */
  .chart-container-sm { height: 160px; }
  .center-pct { font-size: 1.2rem; }
  .completeness-legend {
    flex-direction: column;
    gap: 10px;
    align-items: center;
  }
  .legend-value { font-size: 0.8rem; }

  /* Pagination */
  .pagination { gap: 2px; }
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  /* Table */
  .emp-id-mono { font-size: 0.78rem; }
  .emp-name-link { font-size: 0.8rem; }
  .missing-list { font-size: 0.72rem; }
  .missing-count {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }

  /* Dashboard footer */
  .dashboard-footer {
    font-size: 0.7rem;
    margin-top: 20px;
    padding: 14px 0;
  }

  /* Activity sidebar */
  .activity-avatar {
    width: 28px;
    height: 28px;
  }
  .activity-text { font-size: 0.72rem; }
  .activity-user { font-size: 0.68rem; }
  .activity-time { font-size: 0.65rem; }
}
</style>
