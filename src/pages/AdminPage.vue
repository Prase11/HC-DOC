<template>
  <div class="admin-page">
    <div class="page-header">
      <div>
        <h1 class="page-title">Admin Management</h1>
        <nav class="breadcrumb">
          <router-link to="/" class="breadcrumb-item breadcrumb-home">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
            Dashboard
          </router-link>
          <span class="breadcrumb-sep">›</span>
          <span class="breadcrumb-item breadcrumb-current">Admin Management</span>
        </nav>
      </div>
      <div class="page-actions">
        <button v-if="activeTab === 'admins'" class="btn btn-primary" @click="showAddModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Admin
        </button>
        <button v-if="activeTab === 'doctypes'" class="btn btn-primary" @click="showDocTypeModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Document Type
        </button>
        <button class="btn btn-outline" @click="showImportModal = true">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          Import Data
        </button>
        <button class="btn btn-primary" @click="syncData" :disabled="isSyncing" style="background: linear-gradient(135deg, #006297, #004a73); border: none; box-shadow: 0 2px 8px rgba(0,98,151,.3); margin-left:8px;">
          <svg v-if="!isSyncing" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          <span v-else class="spinner" style="width:16px;height:16px;border-width:2px;margin-right:6px"></span>
          {{ isSyncing ? 'Syncing...' : 'SYNC Data' }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs" style="margin-bottom:20px;">
      <button class="tab-item" :class="{ active: activeTab === 'admins' }" @click="activeTab = 'admins'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Admin Users
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'doctypes' }" @click="activeTab = 'doctypes'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Document Types
      </button>
      <button class="tab-item" :class="{ active: activeTab === 'activities' }" @click="activeTab = 'activities'">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        Activity Logs
      </button>
    </div>

    <!-- ============ ADMIN USERS TAB ============ -->
    <template v-if="activeTab === 'admins'">
      <div v-if="loading" class="card" style="padding:40px;text-align:center;color:var(--text-secondary)">
        <div class="page-spinner"></div>
        <p style="margin-top:12px">Loading admins...</p>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="admins.length === 0" style="padding:40px;text-align:center;color:var(--text-secondary)">
            <p>No admins found. Click <strong>+ Add Admin</strong> to create one.</p>
          </div>
          <div v-else class="doc-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Last Login</th>
                  <th>Status</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in admins" :key="user.id">
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="admin-avatar">
                        <img 
                          v-if="user.employee_id"
                          :src="getThumbnailUrl(user.employee_id)" 
                          :alt="user.name"
                          class="admin-avatar-img"
                          @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                        />
                        <span class="admin-avatar-fallback" :style="user.employee_id ? 'display:none' : ''">{{ user.name.charAt(0) }}</span>
                      </div>
                      <span style="font-weight:600">{{ user.name }}</span>
                    </div>
                  </td>
                  <td style="color:var(--text-secondary)">{{ user.email }}</td>
                  <td>
                    <span class="role-chip" :class="getRoleClass(user.role)">{{ user.role }}</span>
                  </td>
                  <td style="font-size:0.8rem;color:var(--text-secondary)">{{ user.last_login }}</td>
                  <td>
                    <span class="status-badge" :class="user.status === 'active' ? 'status-active' : 'status-disabled'">
                      {{ user.status === 'active' ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td style="text-align:right">
                    <div class="action-btns">
                      <button class="btn btn-ghost btn-sm" @click="openEditModal(user)" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button
                        class="btn btn-sm"
                        :class="user.status === 'active' ? 'btn-danger-ghost' : 'btn-success-ghost'"
                        @click="handleToggle(user)"
                        :disabled="togglingId === user.id"
                      >
                        {{ user.status === 'active' ? 'Disable' : 'Enable' }}
                      </button>
                      <button class="btn btn-sm btn-danger-ghost" @click="confirmDelete(user)" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ DOCUMENT TYPES TAB ============ -->
    <template v-if="activeTab === 'doctypes'">
      <!-- Filter -->
      <div class="doctype-filter" style="margin-bottom:16px;">
        <select v-model="groupFilter" class="form-input" style="max-width:220px;">
          <option value="">All Categories</option>
          <option value="identity">Identity</option>
          <option value="family">Family</option>
          <option value="education">Education</option>
          <option value="employee_letters">Employee Letters</option>
        </select>
      </div>

      <div v-if="loadingDocTypes" class="card" style="padding:40px;text-align:center;color:var(--text-secondary)">
        <div class="page-spinner"></div>
        <p style="margin-top:12px">Loading document types...</p>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="filteredDocTypes.length === 0" style="padding:40px;text-align:center;color:var(--text-secondary)">
            <p>No document types found.</p>
          </div>
          <div v-else class="doc-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px">#</th>
                  <th>Document Name</th>
                  <th>Category</th>
                  <th>Required</th>
                  <th>Multiple</th>
                  <th style="text-align:right">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(dt, idx) in filteredDocTypes" :key="dt.id">
                  <td style="color:var(--text-secondary);font-size:0.8rem;">{{ idx + 1 }}</td>
                  <td>
                    <div style="display:flex;align-items:center;gap:10px">
                      <div class="doc-icon" :class="'doc-icon-' + dt.doc_group">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      </div>
                      <span style="font-weight:600">{{ dt.name }}</span>
                    </div>
                  </td>
                  <td>
                    <span class="group-chip" :class="'group-' + dt.doc_group">{{ groupLabel(dt.doc_group) }}</span>
                  </td>
                  <td>
                    <span class="status-badge" :class="dt.is_required ? 'status-active' : 'status-optional'">
                      {{ dt.is_required ? 'Required' : 'Optional' }}
                    </span>
                  </td>
                  <td>
                    <span class="status-badge" :class="dt.is_multiple ? 'status-multiple' : 'status-single'">
                      {{ dt.is_multiple ? 'Multiple' : 'Single' }}
                    </span>
                  </td>
                  <td style="text-align:right">
                    <div class="action-btns">
                      <button class="btn btn-ghost btn-sm" @click="editDocType(dt)" title="Edit">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                      </button>
                      <button class="btn btn-sm btn-danger-ghost" @click="confirmDeleteDocType(dt)" title="Delete">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>

    <!-- ============ ACTIVITY LOGS TAB ============ -->
    <template v-if="activeTab === 'activities'">
      <div v-if="loadingActivities" class="card" style="padding:40px;text-align:center;color:var(--text-secondary)">
        <div class="page-spinner"></div>
        <p style="margin-top:12px">Loading activity logs...</p>
      </div>

      <div v-else class="card">
        <div class="card-body">
          <div v-if="paginatedActivities.length === 0" style="padding:40px;text-align:center;color:var(--text-secondary)">
            <p>No activity logs found yet.</p>
          </div>
          <div v-else>
            <div class="doc-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="width: 160px">Date / Time</th>
                    <th style="width: 180px">Admin</th>
                    <th style="width: 180px">Action</th>
                    <th style="width: 120px">Employee ID</th>
                    <th>Document</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="act in paginatedActivities" :key="act.id">
                    <td>
                      <div style="font-size:0.8rem;color:var(--text-secondary);">
                        {{ formatFullDate(act.date) }}
                      </div>
                    </td>
                    <td>
                      <div style="display:flex;align-items:center;gap:8px">
                        <div class="admin-avatar" style="width:28px;height:28px;font-size:0.65rem">
                          <img 
                            v-if="act.adminEmployeeId"
                            :src="getThumbnailUrl(act.adminEmployeeId)" 
                            :alt="act.user"
                            class="admin-avatar-img"
                            @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
                          />
                          <span class="admin-avatar-fallback" :style="act.adminEmployeeId ? 'display:none' : ''">{{ act.user.charAt(0) }}</span>
                        </div>
                        <span style="font-weight:600;font-size:0.85rem">{{ act.user }}</span>
                      </div>
                    </td>
                    <td>
                      <span class="status-badge" :class="activityActionClass(act.action)" style="white-space: nowrap;">
                        {{ act.action }}
                      </span>
                    </td>
                    <td style="font-family:'Courier New', monospace; font-weight:600; color:#006297;">
                      {{ act.employeeId }}
                    </td>
                    <td style="font-weight:600; font-size:0.85rem; color:var(--text);">
                      {{ act.document }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination Controls -->
            <div v-if="totalPages > 1" class="pagination" style="margin-top:20px;display:flex;justify-content:center;gap:4px">
              <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              
              <template v-for="p in displayPages" :key="'page-'+p">
                <button v-if="p !== '...'" class="page-btn" :class="{active: currentPage === p}" @click="currentPage = p">
                  {{ p }}
                </button>
                <span v-else class="page-btn ellipsis" disabled>...</span>
              </template>
              
              <button class="page-btn" :disabled="currentPage === totalPages" @click="currentPage++">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Add Admin Modal -->
    <AddAdminModal
      v-if="showAddModal"
      @close="showAddModal = false"
      @saved="onAdminCreated"
    />

    <!-- Edit Admin Modal -->
    <EditAdminModal
      v-if="showEditModal"
      :admin="editingAdmin"
      @close="showEditModal = false"
      @saved="onAdminUpdated"
    />

    <!-- Add/Edit DocType Modal -->
    <DocTypeModal
      v-if="showDocTypeModal"
      :docType="editingDocType"
      @close="showDocTypeModal = false; editingDocType = null"
      @saved="onDocTypeSaved"
    />

    <!-- Delete Admin Confirm Dialog -->
    <teleport to="body">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-content delete-confirm-modal">
          <div class="modal-header">
            <h3 class="modal-title" style="color:#dc2626">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Delete Admin
            </h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ deletingAdmin?.name }}</strong>?</p>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showDeleteConfirm = false" :disabled="deleting">Cancel</button>
            <button class="btn btn-danger" @click="handleDelete" :disabled="deleting">
              <span v-if="deleting" class="spinner"></span>
              {{ deleting ? 'Deleting...' : 'Delete Admin' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Delete DocType Confirm Dialog -->
    <teleport to="body">
      <div v-if="showDeleteDocTypeConfirm" class="modal-overlay" @click.self="showDeleteDocTypeConfirm = false">
        <div class="modal-content delete-confirm-modal">
          <div class="modal-header">
            <h3 class="modal-title" style="color:#dc2626">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              Delete Document Type
            </h3>
          </div>
          <div class="modal-body">
            <p>Are you sure you want to delete <strong>{{ deletingDocType?.name }}</strong>?</p>
            <p style="color:var(--text-secondary);font-size:0.85rem;margin-top:8px">This will affect all employees. Existing uploaded documents will remain but this type won't appear in new records.</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-ghost" @click="showDeleteDocTypeConfirm = false" :disabled="deletingDT">Cancel</button>
            <button class="btn btn-danger" @click="handleDeleteDocType" :disabled="deletingDT">
              <span v-if="deletingDT" class="spinner"></span>
              {{ deletingDT ? 'Deleting...' : 'Delete' }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Toast Notification -->
    <teleport to="body">
      <transition name="toast">
        <div v-if="toast.show" class="toast-notification" :class="'toast-' + toast.type">
          <svg v-if="toast.type === 'success'" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <span>{{ toast.message }}</span>
        </div>
      </transition>
    </teleport>

    <!-- Import Modal -->
    <SettingsModal v-if="showImportModal" @close="showImportModal = false" @imported="handleImported" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../utils/api.js'
import AddAdminModal from '../components/modals/AddAdminModal.vue'
import EditAdminModal from '../components/modals/EditAdminModal.vue'
import DocTypeModal from '../components/modals/DocTypeModal.vue'
import SettingsModal from '../components/modals/SettingsModal.vue'
import { useDossierStore } from '../stores/dossierStore'
import { getThumbnailUrl } from '../utils/thumbnail.js'

// ── Tabs ──
const activeTab = ref('admins')
const showImportModal = ref(false)
const store = useDossierStore()

// ── Admin state ──
const admins = ref([])
const loading = ref(true)
const showAddModal = ref(false)
const showEditModal = ref(false)
const editingAdmin = ref(null)
const showDeleteConfirm = ref(false)
const deletingAdmin = ref(null)
const deleting = ref(false)
const togglingId = ref(null)

// ── DocType state ──
const docTypes = ref([])
const loadingDocTypes = ref(true)
const showDocTypeModal = ref(false)
const editingDocType = ref(null)
const showDeleteDocTypeConfirm = ref(false)
const deletingDocType = ref(null)
const deletingDT = ref(false)
const groupFilter = ref('')

const filteredDocTypes = computed(() => {
  if (!groupFilter.value) return docTypes.value
  return docTypes.value.filter(dt => dt.doc_group === groupFilter.value)
})

// ── Activity Logs state ──
const loadingActivities = ref(true)
const currentPage = ref(1)
const limitPerPage = 15

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * limitPerPage
  const end = start + limitPerPage
  return store.activityLog.slice(start, end)
})

const totalPages = computed(() => {
  return Math.ceil(store.activityLog.length / limitPerPage)
})

const displayPages = computed(() => {
  const tp = totalPages.value
  const cur = currentPage.value
  
  if (tp <= 5) return Array.from({ length: tp }, (_, i) => i + 1)
  if (cur <= 3) return [1, 2, 3, 4, '...', tp]
  if (cur >= tp - 2) return [1, '...', tp - 3, tp - 2, tp - 1, tp]
  return [1, '...', cur - 1, cur, cur + 1, '...', tp]
})

// ── Toast ──
const toast = ref({ show: false, message: '', type: 'success' })
let toastTimer = null
function showToast(message, type = 'success') {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, message, type }
  toastTimer = setTimeout(() => { toast.value.show = false }, 3500)
}

// ── Helpers ──
function getRoleClass(role) {
  if (role === 'Super Admin') return 'role-superadmin'
  if (role === 'Admin') return 'role-admin'
  return ''
}

function groupLabel(g) {
  const map = { identity: 'Identity', family: 'Family', education: 'Education', employment: 'Employee Letters', employee_letters: 'Employee Letters' }
  return map[g] || g
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

function activityActionClass(action) {
  if (!action) return 'status-disabled'
  const actionLower = action.toLowerCase()
  if (actionLower.includes('upload')) return 'status-active'
  if (actionLower.includes('replace')) return 'status-multiple'
  if (actionLower.includes('delete')) return 'status-disabled'
  return 'status-optional'
}

// ── Import Handler ──
function handleImported() {
  showImportModal.value = false
  store.fetchEmployees()
  store.initDocuments()
  store.updateGlobalStats()
  showToast('Data imported successfully!', 'success')
}

// ── Sync Data Handler ──
const isSyncing = ref(false)
async function syncData() {
  if (isSyncing.value) return;
  if (!confirm('Are you sure you want to trigger a manual sync of employee data from Oracle?')) return;
  
  isSyncing.value = true
  try {
    const res = await apiFetch('/api/employees/sync', { method: 'POST' })
    const json = await res.json()
    if (json.success) {
      showToast(`Data synced successfully! ${json.data?.total_imported || 0} employees synced.`, 'success')
      store.fetchEmployees()
      store.initDocuments()
      store.updateGlobalStats()
    } else {
      showToast('Failed to sync data', 'error')
    }
  } catch (e) {
    console.error('Failed to sync:', e)
    showToast('Network error during sync', 'error')
  } finally {
    isSyncing.value = false
  }
}

// ══════════════ Admin CRUD ══════════════
async function fetchAdmins() {
  loading.value = true
  try {
    const res = await apiFetch('/api/admins')
    const json = await res.json()
    if (json.success) admins.value = json.data
  } catch (e) {
    console.error('Failed to fetch admins', e)
    showToast('Failed to load admins', 'error')
  } finally {
    loading.value = false
  }
}

function onAdminCreated() {
  showAddModal.value = false
  showToast('Admin created successfully')
  fetchAdmins()
}

function onAdminUpdated() {
  showEditModal.value = false
  showToast('Admin updated successfully')
  fetchAdmins()
}

function openEditModal(user) {
  editingAdmin.value = { ...user }
  showEditModal.value = true
}

async function handleToggle(user) {
  togglingId.value = user.id
  try {
    const res = await apiFetch(`/api/admins/${user.id}/toggle`, { method: 'PATCH' })
    const json = await res.json()
    if (json.success) {
      showToast(json.message || `Admin ${user.status === 'active' ? 'disabled' : 'enabled'} successfully`)
      fetchAdmins()
    } else {
      showToast(json.message || 'Failed to toggle admin status', 'error')
    }
  } catch (e) {
    showToast('Network error', 'error')
  } finally {
    togglingId.value = null
  }
}

function confirmDelete(user) {
  deletingAdmin.value = user
  showDeleteConfirm.value = true
}

async function handleDelete() {
  if (!deletingAdmin.value) return
  deleting.value = true
  try {
    const res = await apiFetch(`/api/admins/${deletingAdmin.value.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      showToast('Admin deleted successfully')
      showDeleteConfirm.value = false
      fetchAdmins()
    } else {
      showToast(json.message || 'Failed to delete admin', 'error')
    }
  } catch (e) {
    showToast('Network error', 'error')
  } finally {
    deleting.value = false
  }
}

// ══════════════ DocType CRUD ══════════════
async function fetchDocTypes() {
  loadingDocTypes.value = true
  try {
    const res = await apiFetch('/api/doctypes')
    const json = await res.json()
    if (json.success) docTypes.value = json.data
  } catch (e) {
    console.error('Failed to fetch doc types', e)
    showToast('Failed to load document types', 'error')
  } finally {
    loadingDocTypes.value = false
  }
}

function editDocType(dt) {
  editingDocType.value = { ...dt }
  showDocTypeModal.value = true
}

function onDocTypeSaved() {
  const wasEdit = !!editingDocType.value
  showDocTypeModal.value = false
  editingDocType.value = null
  showToast(wasEdit ? 'Document type updated' : 'Document type created')
  fetchDocTypes()
}

function confirmDeleteDocType(dt) {
  deletingDocType.value = dt
  showDeleteDocTypeConfirm.value = true
}

async function handleDeleteDocType() {
  if (!deletingDocType.value) return
  deletingDT.value = true
  try {
    const res = await apiFetch(`/api/doctypes/${deletingDocType.value.id}`, { method: 'DELETE' })
    const json = await res.json()
    if (json.success) {
      showToast('Document type deleted')
      showDeleteDocTypeConfirm.value = false
      fetchDocTypes()
    } else {
      showToast(json.message || 'Failed to delete', 'error')
    }
  } catch (e) {
    showToast('Network error', 'error')
  } finally {
    deletingDT.value = false
  }
}

onMounted(async () => {
  fetchAdmins()
  fetchDocTypes()
  loadingActivities.value = true
  await store.fetchActivities()
  loadingActivities.value = false
})
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 24px;
}
.page-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
.page-title { font-size: 1.5rem; font-weight: 800; }

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 4px;
  border-bottom: 2px solid var(--border);
  padding-bottom: 0;
}
.tab-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border: none;
  background: none;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  border-bottom: 2.5px solid transparent;
  margin-bottom: -2px;
  transition: all 0.2s;
}
.tab-item:hover { color: var(--text); }
.tab-item.active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}

/* ── Tables ── */
.doc-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.admin-avatar {
  width: 34px; height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), var(--accent));
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 700; font-size: 0.8rem; flex-shrink: 0;
  overflow: hidden;
}
.admin-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.admin-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.doc-icon {
  width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.doc-icon-identity { background: rgba(0,98,151,.1); color: #006297; }
.doc-icon-family { background: rgba(168,85,247,.1); color: #a855f7; }
.doc-icon-education { background: rgba(34,197,94,.1); color: #22c55e; }
.doc-icon-employment { background: rgba(245,158,11,.1); color: #f59e0b; }
.doc-icon-employee_letters { background: rgba(245,158,11,.1); color: #f59e0b; }

.role-chip {
  display: inline-block; padding: 3px 10px;
  border-radius: 50px; font-size: 0.75rem; font-weight: 600;
}
.role-superadmin { background: rgba(0,98,151,.1); color: #006297; }
.role-admin      { background: rgba(6,182,212,.1); color: #0891b2; }

.group-chip {
  display: inline-block; padding: 3px 10px;
  border-radius: 50px; font-size: 0.75rem; font-weight: 600;
}
.group-identity { background: rgba(0,98,151,.1); color: #004a73; }
.group-family { background: rgba(168,85,247,.1); color: #9333ea; }
.group-education { background: rgba(34,197,94,.1); color: #16a34a; }
.group-employment { background: rgba(245,158,11,.1); color: #d97706; }
.group-employee_letters { background: rgba(245,158,11,.1); color: #d97706; }

.status-badge {
  display: inline-block; padding: 3px 10px;
  border-radius: 50px; font-size: 0.75rem; font-weight: 600;
}
.status-active { background: rgba(34,197,94,.1); color: #16a34a; }
.status-disabled { background: rgba(239,68,68,.08); color: #dc2626; }
.status-optional { background: rgba(100,116,139,.1); color: #64748b; }
.status-multiple { background: rgba(0,98,151,.1); color: #006297; }
.status-single { background: rgba(100,116,139,.08); color: #94a3b8; }

.action-btns { display: flex; gap: 6px; justify-content: flex-end; }

.btn-danger-ghost {
  background: transparent; color: var(--danger); border: 1.5px solid var(--danger);
}
.btn-danger-ghost:hover { background: #fef2f2; }

.btn-success-ghost {
  background: transparent; color: var(--success); border: 1.5px solid var(--success);
}
.btn-success-ghost:hover { background: #f0fdf4; }

.btn-danger { background: #dc2626; color: #fff; border: none; }
.btn-danger:hover { background: #b91c1c; }

.delete-confirm-modal { max-width: 440px; }
.delete-confirm-modal .modal-title {
  display: flex; align-items: center; gap: 8px;
  font-size: 1.05rem; font-weight: 700;
}

.form-input {
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.88rem;
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.2s;
}
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

/* Toast */
.toast-notification {
  position: fixed; bottom: 24px; right: 24px;
  display: flex; align-items: center; gap: 10px;
  padding: 14px 22px; border-radius: 12px;
  font-size: 0.9rem; font-weight: 600;
  box-shadow: 0 8px 32px rgba(0,0,0,.15); z-index: 10001;
  animation: slideUp 0.35s ease;
}
.toast-success { background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff; }
.toast-error { background: linear-gradient(135deg, #ef4444, #dc2626); color: #fff; }
.toast-enter-active { animation: slideUp 0.35s ease; }
.toast-leave-active { animation: slideDown 0.3s ease; }
@keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes slideDown { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(20px); } }

.page-spinner {
  width: 32px; height: 32px;
  border: 3px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  margin: 0 auto;
}
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
  margin-right: 6px;
}
@keyframes spin { to { transform: rotate(360deg); } }

@media (max-width: 768px) {
  .page-title { font-size: 1.25rem; }
  .action-btns { flex-wrap: wrap; gap: 4px; }
  .action-btns .btn { font-size: 0.72rem; padding: 4px 8px; }
  .tab-item { padding: 8px 12px; font-size: 0.82rem; }
}

@media (max-width: 480px) {
  .page-title { font-size: 1.1rem; }
  .page-actions {
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }
  .page-actions .btn {
    font-size: 0.72rem;
    padding: 6px 10px;
    flex: 1;
    min-width: 0;
    justify-content: center;
  }
  .tab-item {
    padding: 6px 10px;
    font-size: 0.75rem;
    gap: 4px;
  }
  .tab-item svg {
    width: 14px;
    height: 14px;
  }
  .action-btns .btn {
    font-size: 0.68rem;
    padding: 3px 6px;
  }
  .admin-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.7rem;
  }
  .role-chip,
  .group-chip,
  .status-badge {
    font-size: 0.68rem;
    padding: 2px 8px;
  }
  .doc-icon {
    width: 28px;
    height: 28px;
  }
  .toast-notification {
    left: 12px;
    right: 12px;
    bottom: 12px;
    font-size: 0.8rem;
    padding: 12px 16px;
  }

  /* Pagination */
  .page-btn {
    min-width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>
