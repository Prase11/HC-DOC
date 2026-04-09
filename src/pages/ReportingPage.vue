<template>
  <div class="reporting-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Reporting</h1>
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item breadcrumb-home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </router-link>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-item breadcrumb-current">Reporting</span>
        </nav>
      </div>
      <div class="page-actions">
        <button class="btn btn-outline" @click="exportExcel">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          Export to Excel
        </button>
        <button class="btn btn-primary" @click="exportPdf">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Export to PDF
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="card filter-bar" v-if="reportTab !== 'statistics'">
      <div class="card-body" style="padding:14px 20px">
        <div class="filters">
          <div class="filter-group">
            <label class="form-label" style="margin-bottom:4px">Search Employee</label>
            <input type="text" class="form-input" v-model="filterSearch" placeholder="Search ID, Name, or Unit..." @keyup.enter="applySearch">
          </div>
          <div class="filter-group" v-if="reportTab === 'missing'">
            <label class="form-label" style="margin-bottom:4px">Document Type</label>
            <select v-model="filterType" class="form-select">
              <option value="">All Types</option>
              <option value="identity">Identity</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="employment">Employee Letters</option>
            </select>
          </div>
          <div class="filter-group" v-if="reportTab === 'missing'">
            <label class="form-label" style="margin-bottom:4px">Document Name</label>
            <select v-model="filterDocName" class="form-select">
              <option value="">All Names</option>
              <option v-for="name in availableDocumentNames" :key="name" :value="name">{{ name }}</option>
            </select>
          </div>
          <div class="filter-group" v-if="reportTab === 'missing'">
            <label class="form-label" style="margin-bottom:4px">Status</label>
            <select v-model="filterStatus" class="form-select">
              <option value="">All Status</option>
              <option value="complete">Complete</option>
              <option value="incomplete">Incomplete</option>
              <option value="optional">Optional</option>
            </select>
          </div>
          <div class="filter-group" style="align-self:flex-end">
            <button class="btn btn-ghost btn-sm" @click="clearFilters">Clear Filters</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Report Tabs -->
    <div class="tabs" style="margin-bottom:20px">
      <button class="tab-item" :class="{ active: reportTab === 'completeness' }" @click="reportTab = 'completeness'">Completeness Report</button>
      <button class="tab-item" :class="{ active: reportTab === 'missing' }" @click="reportTab = 'missing'">Incomplete Documents</button>
      <button class="tab-item" :class="{ active: reportTab === 'statistics' }" @click="reportTab = 'statistics'">Statistics</button>
    </div>

    <!-- Completeness Report -->
    <div v-if="reportTab === 'completeness'" class="card">
      <div class="card-body">
        <h3 class="section-title">Employee Document Completeness</h3>
        <div class="doc-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Unit</th>
                <th>Total Docs</th>
                <th>Complete</th>
                <th>Incomplete</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in completenessReport" :key="row.id">
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="mini-avatar" :style="{ background: getAvatarColor(row.id) }">
                      <img 
                        :src="getThumbnailUrl(row.id)" 
                        :alt="row.name"
                        class="mini-avatar-img"
                        loading="lazy"
                        referrerpolicy="no-referrer"
                        @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                      />
                      <span class="mini-avatar-fallback" style="display:none">{{ row.initials }}</span>
                    </div>
                    <div>
                      <div style="font-weight:600">{{ row.name }}</div>
                      <div style="font-size:0.72rem;color:var(--text-secondary)">{{ row.id }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ row.unit }}</td>
                <td>{{ row.total }}</td>
                <td><span style="color:#059669;font-weight:600">{{ row.complete }}</span></td>
                <td><span :style="{ color: row.incomplete > 0 ? '#d97706' : '#94a3b8', fontWeight: 600 }">{{ row.incomplete }}</span></td>
                <td>
                  <div style="display:flex;align-items:center;gap:10px">
                    <div class="progress-bar" style="width:100px">
                      <div class="progress-bar-fill" :style="{ width: row.percentage + '%' }"></div>
                    </div>
                    <span style="font-weight:700;font-size:0.85rem">{{ row.percentage }}%</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination" v-if="completenessTotalPages > 1 && reportTab === 'completeness'">
          <button class="page-btn" :disabled="completenessCurrentPage === 1" @click="completenessCurrentPage--">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button
            v-for="p in completenessDisplayPages"
            :key="p"
            class="page-btn"
            :class="{ active: p === completenessCurrentPage, ellipsis: p === '...' }"
            :disabled="p === '...'"
            @click="p !== '...' && (completenessCurrentPage = p)"
          >{{ p }}</button>
          <button class="page-btn" :disabled="completenessCurrentPage === completenessTotalPages" @click="completenessCurrentPage++">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Incomplete Documents Report -->
    <div v-if="reportTab === 'missing'" class="card">
      <div class="card-body">
        <h3 class="section-title">Incomplete Documents Report</h3>
        <div class="doc-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Unit</th>
                <th>Document</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, i) in missingReport" :key="i">
                <td style="font-weight:600">{{ row.employeeName }}</td>
                <td>{{ row.unit }}</td>
                <td>{{ row.docName }}</td>
                <td><span class="category-chip">{{ row.category }}</span></td>
                <td><StatusBadge :status="row.status" /></td>
              </tr>
              <tr v-if="!missingReport.length">
                <td colspan="5" style="text-align:center;padding:24px;color:var(--text-secondary)">All documents are complete!</td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="pagination" v-if="totalPages > 1 && reportTab === 'missing'">
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

    <!-- Statistics -->
    <div v-if="reportTab === 'statistics'" class="card">
      <div class="card-body">
        <h3 class="section-title">Document Statistics</h3>
        <div class="stats-summary">
          <div class="stat-item">
            <span class="stat-value" style="color:var(--primary)">{{ stats.totalDocs }}</span>
            <span class="stat-label">Total Documents</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" style="color:#059669">{{ stats.totalComplete }}</span>
            <span class="stat-label">Complete</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" style="color:#d97706">{{ stats.totalIncomplete }}</span>
            <span class="stat-label">Incomplete</span>
          </div>
          <div class="stat-item">
            <span class="stat-value" style="color:#94a3b8">{{ stats.totalOptional }}</span>
            <span class="stat-label">Optional</span>
          </div>
        </div>

        <h4 style="margin-top:24px;margin-bottom:12px;font-size:0.9rem;font-weight:700">By Category</h4>
        <div class="doc-table-wrap">
          <table class="data-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total</th>
                <th>Complete</th>
                <th>Incomplete</th>
                <th>Optional</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cat in categoryStats" :key="cat.name">
                <td style="font-weight:600">{{ cat.name }}</td>
                <td>{{ cat.total }}</td>
                <td style="color:#059669;font-weight:600">{{ cat.complete }}</td>
                <td style="color:#d97706;font-weight:600">{{ cat.incomplete }}</td>
                <td style="color:#94a3b8;font-weight:600">{{ cat.optional }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useDossierStore } from '../stores/dossierStore'
import { getThumbnailUrl } from '../utils/thumbnail.js'

const store = useDossierStore()

const filterType = ref('')
const filterDocName = ref('')
const filterStatus = ref('')
const filterSearch = ref('')
const reportTab = ref('completeness')

function clearFilters() {
  filterType.value = ''
  filterDocName.value = ''
  filterStatus.value = ''
  filterSearch.value = ''
}

function applySearch() {
  // The watch hook handles it based on the debounced input or Enter key
}

const availableDocumentNames = computed(() => {
    let names = [];
    const cats = store.documentCategories;
    
    // If a specific type is selected, only show those names
    if (filterType.value && cats[filterType.value]) {
        names = [...cats[filterType.value].documents];
    } else {
        // Collect all documents
        for (const cat in cats) {
            names = names.concat(cats[cat].documents);
        }
    }
    
    return [...new Set(names)].sort();
})

// Auto-reset docName filter if type changes and current docName doesn't belong
watch(filterType, () => {
    if (filterDocName.value && !availableDocumentNames.value.includes(filterDocName.value)) {
        filterDocName.value = '';
    }
})

const avatarColors = [
  'linear-gradient(135deg, #006297, #4d9bc4)',
  'linear-gradient(135deg, #006297, #4d9bc4)',
  'linear-gradient(135deg, #f59e0b, #fbbf24)',
  'linear-gradient(135deg, #10b981, #6ee7b7)',
  'linear-gradient(135deg, #ef4444, #fca5a5)',
  'linear-gradient(135deg, #8b5cf6, #c4b5fd)',
  'linear-gradient(135deg, #ec4899, #f9a8d4)',
  'linear-gradient(135deg, #3b82f6, #93c5fd)'
]
function getAvatarColor(id) {
  return avatarColors[parseInt(id) % avatarColors.length]
}

const stats = computed(() => store.globalStats)

// Completeness report
const completenessReport = computed(() => store.backendCompletenessReport)

// Pagination for completeness report
const completenessCurrentPage = ref(1)
const completenessPageSize = 20
const completenessTotalPages = computed(() => store.backendCompletenessPagination.totalPages || 1)

const completenessDisplayPages = computed(() => {
  const total = completenessTotalPages.value
  const current = completenessCurrentPage.value
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

function fetchCompleteness() {
  return store.fetchCompletenessReport('', filterStatus.value, filterSearch.value, completenessCurrentPage.value, completenessPageSize)
}

// Missing documents report
const missingReport = computed(() => store.backendMissingReport)

// Pagination for missing report
const currentPage = ref(1)
const pageSize = 10
const totalPages = computed(() => store.backendMissingPagination.totalPages || 1)

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

function fetchMissing() {
  return store.fetchMissingReport({
    type: filterType.value,
    status: filterStatus.value,
    docName: filterDocName.value,
    search: filterSearch.value,
    page: currentPage.value,
    limit: pageSize,
    format: 'flat'
  })
}

// Category stats
const categoryStats = computed(() => store.backendCategoryStats)

// Fetch data on mount and when filters change
onMounted(async () => {
    store.backendMissingReport = []; // Clear Dashboard grouped data to prevent UI bleeding
    await fetchCompleteness()
    await fetchMissing()
    if (!store.globalStats.totalDocs) {
        await store.fetchDashboardStats()
    }
})

// When filters change, fetch completeness and reset missing pagination to page 1
watch([filterType, filterStatus, filterDocName, filterSearch], async () => {
    completenessCurrentPage.value = 1
    await fetchCompleteness()
    currentPage.value = 1
    await fetchMissing()
})

// Watch page change to fetch new data
watch(currentPage, async (newPage, oldPage) => {
    if (newPage !== oldPage) {
        await fetchMissing()
    }
})

watch(completenessCurrentPage, async (newPage, oldPage) => {
    if (newPage !== oldPage) {
        await fetchCompleteness()
    }
})

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { apiFetch } from '../utils/api.js'

async function getExportData() {
  const params = new URLSearchParams()
  if (filterType.value) params.append('type', filterType.value)
  if (filterDocName.value) params.append('docName', filterDocName.value)
  if (filterStatus.value) params.append('status', filterStatus.value)
  if (filterSearch.value) params.append('search', filterSearch.value)
  params.append('tab', reportTab.value)

  try {
    const res = await apiFetch(`/api/reports/export?${params}`)
    const json = await res.json()
    if (json.success) {
      return json
    }
  } catch (error) {
    console.error('Failed to fetch export data:', error)
  }
  return null
}

async function exportExcel() {
  const result = await getExportData()
  if (!result || !result.data || result.data.length === 0) {
    alert('No data available to export.')
    return
  }

  const { data, title } = result
  const worksheet = XLSX.utils.json_to_sheet(data)

  // Auto-width columns
  if (data.length > 0) {
    const keys = Object.keys(data[0])
    const colWidths = keys.map(key => {
      const maxContent = Math.max(
        key.length,
        ...data.map(row => (row[key] ? row[key].toString().length : 0))
      )
      return { wch: maxContent + 2 } // add some padding
    })
    worksheet['!cols'] = colWidths
  }

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report')

  // Generate date string for filename
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}.xlsx`
  
  XLSX.writeFile(workbook, filename)
}

async function exportPdf() {
  const result = await getExportData()
  if (!result || !result.data || result.data.length === 0) {
    alert('No data available to export.')
    return
  }

  const { data, title } = result
  
  // Create PDF landscape or portrait depending on columns
  const keys = Object.keys(data[0])
  const orientation = keys.length > 5 ? 'landscape' : 'portrait'
  const doc = new jsPDF(orientation)

  // Add Header
  doc.setFontSize(16)
  doc.text('PT Garuda Maintenance Facility Aero Asia Tbk.', 14, 15)
  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.text('HC Document Report', 14, 22)
  
  doc.setFontSize(10)
  doc.setTextColor(0)
  doc.text(`Report: ${title}`, 14, 32)
  doc.text(`Date Generated: ${new Date().toLocaleString()}`, 14, 38)
  
  // Create table
  const columns = keys.map(k => ({ header: k, dataKey: k }))
  const rows = data

  autoTable(doc, {
    startY: 45,
    columns: columns,
    body: rows,
    headStyles: { fillColor: [13, 148, 136] }, // Tailwind teal-600 to match app theme
    styles: { fontSize: 8, cellPadding: 2 },
    alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
  })

  // Save
  const dateStr = new Date().toISOString().split('T')[0]
  const filename = `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${dateStr}.pdf`
  doc.save(filename)
}
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
}
.page-title { font-size: 1.5rem; font-weight: 800; }
.page-subtitle { font-size: 0.875rem; color: var(--text-secondary); margin-top: 2px; }
.page-actions { display: flex; gap: 10px; }

.filter-bar { margin-bottom: 20px; }
.filters { display: flex; gap: 16px; align-items: flex-end; flex-wrap: wrap; }
.filter-group { min-width: 160px; }

.section-title { font-size: 1rem; font-weight: 700; margin-bottom: 16px; }
.doc-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.mini-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  flex-shrink: 0;
  overflow: hidden;
}
.mini-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mini-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.category-chip {
  display: inline-block;
  padding: 3px 10px;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
  background: rgba(0,98,151,.08);
  color: var(--primary);
}

.stats-summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: var(--surface-variant);
  border-radius: var(--radius-lg);
}
.stat-value { font-size: 1.75rem; font-weight: 800; }
.stat-label { font-size: 0.78rem; color: var(--text-secondary); margin-top: 4px; font-weight: 500; }

@media (max-width: 768px) {
  .stats-summary { grid-template-columns: repeat(2, 1fr); }
  .filters { flex-direction: column; }
  .filter-group {
    width: 100%;
    min-width: unset;
  }
  .page-actions {
    flex-direction: column;
    width: 100%;
  }
  .page-actions .btn {
    width: 100%;
    justify-content: center;
  }
  .page-title { font-size: 1.25rem; }
}

@media (max-width: 480px) {
  .stats-summary { grid-template-columns: 1fr; }
  .stat-value { font-size: 1.4rem; }
}

/* ── Pagination ────────────────────────────────── */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: 16px;
  padding-bottom: 16px;
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
  background: linear-gradient(135deg, #006297, #004a73);
  color: #fff; border-color: #006297;
}
.page-btn:disabled { opacity: .4; cursor: not-allowed; }
.page-btn.ellipsis { border: none; cursor: default; }

@media (max-width: 480px) {
  .page-title { font-size: 1.1rem; }
  .page-actions {
    width: 100%;
  }
  .page-actions .btn {
    font-size: 0.72rem;
    padding: 6px 10px;
  }
  .filters {
    gap: 10px;
  }
  .filter-group {
    min-width: unset;
  }
  .section-title { font-size: 0.88rem; }

  .stats-summary { grid-template-columns: 1fr 1fr; }
  .stat-value { font-size: 1.2rem; }
  .stat-item { padding: 14px; }

  .pagination { gap: 2px; }
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }

  .mini-avatar {
    width: 26px;
    height: 26px;
    font-size: 0.6rem;
    border-radius: 6px;
  }
  .category-chip {
    font-size: 0.68rem;
    padding: 2px 8px;
  }
}
</style>
