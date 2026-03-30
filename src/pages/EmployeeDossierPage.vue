<template>
  <div class="edossier-page">
    <div class="page-header">
      <h1 class="page-title">E-Dossier</h1>
      <nav class="breadcrumb">
        <router-link to="/" class="breadcrumb-item breadcrumb-home">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
          Dashboard
        </router-link>
        <span class="breadcrumb-sep">›</span>
        <span class="breadcrumb-item breadcrumb-current">E-Dossier</span>
      </nav>
    </div>

    <!-- Stat Cards -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-card-icon stat-icon-primary">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        </div>
        <div class="stat-card-data">
          <span class="stat-card-value">{{ store.employeePagination.total }}</span>
          <span class="stat-card-label">Total Active Employee</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon stat-icon-success">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="stat-card-data">
          <span class="stat-card-value">{{ totalCompleteCount }}</span>
          <span class="stat-card-label">Document Complete</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-card-icon stat-icon-warning">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div class="stat-card-data">
          <span class="stat-card-value">{{ totalIncompleteCount }}</span>
          <span class="stat-card-label">Document Incomplete</span>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-row">
      <select v-model="filterStatus" class="filter-select">
        <option value="">All Status</option>
        <option value="completed">Completed</option>
        <option value="incomplete">InComplete</option>
      </select>

      <div class="search-box">
        <input v-model="searchQuery" type="text" placeholder="Search ID, Name, or Unit..." class="search-input" />
        <svg class="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      </div>
    </div>

    <!-- Employee Table -->
    <div class="card">
      <div class="card-body table-card-body">
        <div class="table-wrap">
          <table class="data-table emp-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Unit</th>
                <th>Complete Status</th>
                <th>Document Missing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="emp in paginatedEmployees" :key="emp.id">
                <td><span class="emp-id-cell">{{ emp.id }}</span></td>
                <td><span class="emp-name-cell">{{ emp.name }}</span></td>
                <td><span class="emp-unit-cell">{{ emp.unit || '-' }}</span></td>
                <td>
                  <span class="status-label" :class="emp.statusClass">{{ emp.statusText }}</span>
                </td>
                <td><span class="missing-count-cell">{{ emp.missingCount }}</span></td>
                <td>
                  <div class="action-btns">
                    <router-link :to="`/e-dossier/${emp.id}`" class="action-btn" title="View Detail">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    </router-link>
                    <button class="action-btn action-edit" title="Edit" @click="openEdit(emp)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="action-btn action-delete" title="Hapus" @click="confirmDelete(emp)">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="!paginatedEmployees.length">
                <td colspan="5" class="empty-row">No employees found</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <div class="pagination" v-if="store.employeePagination.totalPages > 1">
          <span class="page-info">Page {{ store.employeePagination.page }} of {{ store.employeePagination.totalPages }} ({{ store.employeePagination.total }} employees)</span>
          <div class="page-btns">
            <button class="page-btn" :disabled="store.employeePagination.page <= 1" @click="goToPage(store.employeePagination.page - 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <button
              v-for="p in displayPages"
              :key="p"
              class="page-btn"
              :class="{ active: p === store.employeePagination.page, ellipsis: p === '...' }"
              :disabled="p === '...'"
              @click="p !== '...' && goToPage(p)"
            >{{ p }}</button>
            <button class="page-btn" :disabled="store.employeePagination.page >= store.employeePagination.totalPages" @click="goToPage(store.employeePagination.page + 1)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="page-footer">
      <span>COPYRIGHT © 2025 <strong>HR E-Dossier System</strong></span>
      <span>Hand-crafted & Made with ❤️</span>
    </footer>

    <!-- Edit Employee Modal -->
    <EditEmployeeModal
      v-if="showEditModal"
      :employee="editingEmployee"
      @close="showEditModal = false"
      @saved="handleEditSaved"
    />

    <!-- Delete Confirmation -->
    <teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay confirm-overlay" @click.self="cancelDelete">
        <div class="confirm-box">
          <div class="confirm-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3 class="confirm-title">Hapus Karyawan?</h3>
          <p class="confirm-text">Apakah kamu yakin ingin menghapus <strong>{{ deletingEmployee?.name }}</strong> ({{ deletingEmployee?.id }})? Semua data dossier karyawan ini juga akan dihapus.</p>
          <div class="confirm-actions">
            <button class="btn btn-ghost" @click="cancelDelete">Batal</button>
            <button class="btn btn-danger" @click="doDelete" :disabled="deleting || countdown > 0">
              <span v-if="deleting">Menghapus...</span>
              <span v-else-if="countdown > 0" class="countdown-btn">
                <svg class="countdown-ring" width="22" height="22" viewBox="0 0 22 22">
                  <circle cx="11" cy="11" r="9" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="2" />
                  <circle cx="11" cy="11" r="9" fill="none" stroke="#fff" stroke-width="2"
                    stroke-dasharray="56.5" :stroke-dashoffset="56.5 - (56.5 * (5 - countdown) / 5)"
                    stroke-linecap="round" transform="rotate(-90 11 11)" style="transition: stroke-dashoffset 1s linear" />
                </svg>
                {{ countdown }}s
              </span>
              <span v-else>Ya, Hapus</span>
            </button>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { apiFetch } from '../utils/api.js';
import { ref, computed, watch, onMounted } from 'vue'
import { useDossierStore } from '../stores/dossierStore'
import EditEmployeeModal from '../components/modals/EditEmployeeModal.vue'

const store = useDossierStore()

const searchQuery = ref('')
const filterStatus = ref('')

const pageSize = 20

// Edit state
const showEditModal = ref(false)
const editingEmployee = ref(null)

// Delete state
const showDeleteConfirm = ref(false)
const deletingEmployee = ref(null)
const deleting = ref(false)
const countdown = ref(0)
let countdownTimer = null
let searchTimeout = null



// Build row data from currently loaded (server-paginated) employees
const paginatedEmployees = computed(() => {
  return store.employees.map(emp => {
    const stats = store.getEmployeeDocStats(emp.id)
    const isComplete = stats.percentage === 100
    return {
      id: emp.id,
      name: emp.name,
      unit: emp.unit,
      position: emp.position,
      statusText: isComplete ? 'Completed' : 'InComplete',
      statusClass: isComplete ? 'status-complete' : 'status-incomplete',
      missingCount: stats.incomplete,
      percentage: stats.percentage,
      complete: stats.complete
    }
  })
})

// Global Totals (fetched from dashboard stats endpoint)
const totalCompleteCount = computed(() => store.globalStats.totalComplete)
const totalIncompleteCount = computed(() => store.globalStats.totalIncomplete)

// Page navigation
const displayPages = computed(() => {
  const total = store.employeePagination.totalPages
  const current = store.employeePagination.page
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (current > 3) pages.push('...')
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i)
    if (current < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

async function goToPage(page) {
  await store.fetchEmployees({ page, limit: pageSize, search: searchQuery.value, docStatus: filterStatus.value })
  // Generate doc stubs for newly loaded employees
  for (const emp of store.employees) {
    store.fetchEmployeeDocs(emp.id)
  }
}

// Watch search/filter and refetch from server
watch([searchQuery, filterStatus], () => {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    goToPage(1)
  }, 400)
})

onMounted(async () => {
  await goToPage(1)
  if (!store.globalStats.totalDocs) {
    await store.fetchDashboardStats()
  }
})

// ── Edit ──
function openEdit(emp) {
  editingEmployee.value = emp
  showEditModal.value = true
}

async function handleEditSaved() {
  showEditModal.value = false
  await goToPage(store.employeePagination.page)
  store.fetchDashboardStats()
}

// ── Delete ──
function confirmDelete(emp) {
  deletingEmployee.value = emp
  showDeleteConfirm.value = true
  countdown.value = 5
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) clearInterval(countdownTimer)
  }, 1000)
}

function cancelDelete() {
  showDeleteConfirm.value = false
  clearInterval(countdownTimer)
  countdown.value = 0
}

async function doDelete() {
  deleting.value = true
  try {
    const res = await apiFetch(`/api/employees/${deletingEmployee.value.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      showDeleteConfirm.value = false
      await goToPage(store.employeePagination.page)
      store.fetchDashboardStats()
    }
  } catch (e) {
    console.error('Delete failed:', e)
  } finally {
    deleting.value = false
  }
}
</script>

<style scoped>
.page-header { margin-bottom: 20px; }
.page-title { font-size: 1.5rem; font-weight: 800; color: var(--text); }

/* ── Stat Cards ────────────────────── */
.stat-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: 0 1px 3px rgba(0,0,0,.04);
}
.stat-card-icon {
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
.stat-card-data { display: flex; flex-direction: column; }
.stat-card-value { font-size: 1.75rem; font-weight: 800; color: var(--text); line-height: 1.1; }
.stat-card-label { font-size: 0.8rem; color: #0ea5e9; font-weight: 600; margin-top: 4px; }

/* ── Filters ───────────────────────── */
.filters-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  justify-content: flex-end;
}
.filter-select {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.85rem;
  color: var(--text-secondary);
  outline: none;
  cursor: pointer;
  appearance: auto;
  min-width: 140px;
}
.filter-select:focus { border-color: #0ea5e9; }
.search-box {
  position: relative;
}
.search-input {
  padding: 8px 32px 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--surface);
  font-size: 0.85rem;
  color: var(--text);
  outline: none;
  width: 200px;
}
.search-input:focus { border-color: #0ea5e9; width: 240px; }
.search-icon {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

/* ── Table ─────────────────────────── */
.table-card-body { padding: 0; }
.table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }
.emp-table th { font-size: 0.78rem; text-transform: uppercase; letter-spacing: 0.04em; color: #64748b; }
.emp-table td { vertical-align: middle; }
.emp-id-cell { font-family: 'Courier New', monospace; font-weight: 600; color: var(--text); font-size: 0.85rem; }
.emp-name-cell { font-weight: 600; color: var(--text); }
.emp-unit-cell { color: var(--text-secondary); font-size: 0.82rem; }
.missing-count-cell { font-weight: 600; color: var(--text); }
.empty-row { text-align: center; padding: 32px !important; color: var(--text-secondary); }

/* ── Status Labels ─────────────────── */
.status-label {
  display: inline-block;
  padding: 4px 14px;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}
.status-complete {
  background: rgba(16,185,129,.08);
  color: #059669;
}
.status-incomplete {
  background: rgba(245,158,11,.08);
  color: #d97706;
}

/* ── Action Buttons ────────────────── */
.action-btns {
  display: flex;
  align-items: center;
  gap: 6px;
}
.action-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  background: none;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}
.action-btn:hover {
  background: rgba(14,165,233,.08);
  color: #0ea5e9;
  border-color: #0ea5e9;
}
.action-edit:hover {
  background: rgba(16,185,129,.08);
  color: #10b981;
  border-color: #10b981;
}
.action-delete:hover {
  background: rgba(239,68,68,.08);
  color: #ef4444;
  border-color: #ef4444;
}

/* ── Delete Confirmation ──────────── */
.confirm-overlay { z-index: 1001; }
.confirm-box {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 32px;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0,0,0,.15);
}
.confirm-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(245,158,11,.1);
  color: #f59e0b;
  margin: 0 auto 16px;
}
.confirm-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 8px;
}
.confirm-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 24px;
}
.confirm-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
.btn-danger {
  background: #ef4444;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: var(--radius);
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-danger:hover { background: #dc2626; }
.btn-danger:disabled { opacity: .6; cursor: not-allowed; }

/* ── Countdown ────────────────────── */
.countdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.countdown-ring {
  flex-shrink: 0;
}

/* ── Pagination ────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid var(--border);
}
.page-info {
  font-size: 0.82rem;
  color: var(--text-secondary);
  font-weight: 500;
}
.page-btns {
  display: flex;
  align-items: center;
  gap: 4px;
}
.page-btn {
  display: flex; align-items: center; justify-content: center;
  min-width: 32px; height: 32px;
  border: 1px solid var(--border);
  border-radius: 50%;
  background: var(--surface);
  font-size: 0.82rem; font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 4px;
}
.page-btn:hover:not(:disabled):not(.active) { background: #f1f5f9; color: var(--text); }
.page-btn.active {
  background: #0ea5e9;
  color: #fff; border-color: #0ea5e9;
}
.page-btn:disabled { opacity: .4; cursor: not-allowed; }

/* ── Footer ────────────────────────── */
.page-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 0;
  margin-top: 32px;
  border-top: 1px solid var(--border);
  font-size: 0.78rem;
  color: var(--text-secondary);
}

@media (max-width: 768px) {
  .stat-cards { grid-template-columns: 1fr; }
  .filters-row {
    flex-wrap: wrap;
  }
  .filter-select {
    width: 100%;
    min-width: unset;
  }
  .search-box {
    width: 100%;
  }
  .search-input {
    width: 100%;
  }
  .pagination {
    flex-direction: column;
    gap: 8px;
  }
  .page-info {
    text-align: center;
  }
  .page-footer {
    flex-direction: column;
    text-align: center;
    gap: 6px;
  }
  .page-title { font-size: 1.25rem; }
  .stat-card {
    padding: 16px;
  }
  .stat-card-value {
    font-size: 1.4rem;
  }
  .action-btns {
    gap: 4px;
  }
  .action-btn {
    width: 28px;
    height: 28px;
  }
}

@media (max-width: 480px) {
  .page-title { font-size: 1.1rem; }
  .stat-card {
    padding: 12px;
    gap: 10px;
  }
  .stat-card-icon {
    width: 36px;
    height: 36px;
  }
  .stat-card-icon svg {
    width: 20px;
    height: 20px;
  }
  .stat-card-value { font-size: 1.1rem; }
  .stat-card-label { font-size: 0.72rem; }

  .filters-row {
    gap: 8px;
  }
  .filter-select {
    font-size: 0.78rem;
    padding: 6px 24px 6px 10px;
  }
  .search-input {
    font-size: 0.78rem;
    padding: 6px 28px 6px 10px;
  }
  .search-input:focus {
    width: 100%;
  }

  .pagination {
    gap: 6px;
  }
  .page-info {
    font-size: 0.72rem;
  }
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .page-footer {
    font-size: 0.7rem;
    margin-top: 20px;
  }

  .action-btn {
    width: 26px;
    height: 26px;
  }

  .confirm-box {
    padding: 20px;
  }
  .confirm-title { font-size: 0.95rem; }
  .confirm-text { font-size: 0.8rem; }
}
</style>
