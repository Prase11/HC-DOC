<template>
  <div class="detail-page" v-if="isLoading">
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Loading employee data...</p>
    </div>
  </div>

  <div class="detail-page" v-else-if="employee">
    <!-- Success Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast-notification">
        <div class="toast-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
        </div>
        <div class="toast-content">
          <h4>Success</h4>
          <p>{{ toastMessage }}</p>
        </div>
      </div>
    </transition>

    <!-- Breadcrumb -->
    <nav class="breadcrumb" style="margin-bottom: 16px;">
      <router-link to="/" class="breadcrumb-item breadcrumb-home">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
        Dashboard
      </router-link>
      <span class="breadcrumb-sep">›</span>
      <router-link to="/e-dossier" class="breadcrumb-item">E-Dossier</router-link>
      <span class="breadcrumb-sep">›</span>
      <span class="breadcrumb-item breadcrumb-current">{{ employee?.name || employeeId }}</span>
    </nav>

    <!-- Profile Card -->
    <div class="card profile-card">
      <div class="card-body">
        <div class="profile-row">
          <div class="profile-left">
            <div class="profile-avatar" :style="{ background: avatarGradient }">
              <img 
                :src="`https://api-myhc.gmf-aeroasia.co.id/thumbnail/${employee.id}.jpg`" 
                :alt="employee.name"
                class="profile-avatar-img"
                @error="$event.target.style.display='none'; $event.target.nextElementSibling.style.display='flex'"
              />
              <span class="profile-avatar-fallback" style="display:none">{{ initials }}</span>
            </div>
            <div class="profile-info">
              <h2 class="profile-name">{{ employee.name }}</h2>
              <div class="profile-meta">
                <span class="meta-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/></svg>
                  ID: {{ employee.id }}
                </span>
                <span class="meta-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ employee.unit }}
                </span>
                <span class="meta-chip">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {{ employee.position }}
                </span>
              </div>
            </div>
          </div>
          <div class="profile-right">
            <div class="completion-ring">
              <svg viewBox="0 0 80 80" class="ring-svg">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#e2e8f0" stroke-width="6"/>
                <circle cx="40" cy="40" r="34" fill="none" :stroke="ringColor" stroke-width="6" stroke-linecap="round"
                  :stroke-dasharray="ringDash" stroke-dashoffset="0" transform="rotate(-90 40 40)"
                  style="transition: stroke-dasharray .6s ease"/>
              </svg>
              <span class="ring-value">{{ docStats.percentage }}%</span>
            </div>
            <span class="completion-label">Document Completion</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Alert Banner -->
    <div v-if="docStats.incomplete > 0" class="alert alert-warning">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <strong>{{ docStats.incomplete }} document{{ docStats.incomplete > 1 ? 's' : '' }} need{{ docStats.incomplete === 1 ? 's' : '' }} to be completed</strong>
    </div>

    <!-- Tabs -->
    <div class="tabs-container card">
      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="tab-item"
          :class="{ active: activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <span class="tab-count">
            {{ getTabCount(tab.key) }}
          </span>
        </button>
      </div>

      <div class="tab-content">
        <!-- Unified Document Table for all Tabs -->
        <div>
          <div class="doc-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th style="width:40px"></th>
                  <th>DOCUMENT NAME</th>
                  <th>STATUS</th>
                  <th style="text-align:right">ACTION</th>
                </tr>
              </thead>
              <tbody>
                <template v-for="doc in currentDocuments" :key="doc.name">
                  <!-- Main Row -->
                  <tr class="sk-main-row" :class="{ expanded: expandedSK === doc.name, 'row-na': doc.status === 'optional' }">
                    <td style="text-align:center">
                      <button v-if="doc.isMultiple" class="expand-btn" @click="toggleExpand(doc.name)">
                        <svg :class="{ rotated: expandedSK === doc.name }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                      </button>
                      <svg v-else-if="doc.status !== 'optional'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    </td>
                    <td>
                      <span class="doc-name-label" :class="{ 'text-na': doc.status === 'optional' }">{{ doc.name }}</span>
                      <span v-if="doc.isMultiple && doc.versions.length > 0" class="version-count">({{ doc.versions.length }} versi)</span>
                    </td>
                    <td>
                      <span class="badge" :class="doc.status === 'complete' ? 'badge-success' : doc.status === 'optional' ? 'badge-secondary' : 'badge-warning'">
                        {{ doc.status === 'complete' ? 'Complete' : doc.status === 'optional' ? 'N/A' : 'Incomplete' }}
                      </span>
                    </td>
                    <td style="text-align:right">
                      <button v-if="!doc.isMultiple" class="btn btn-outline btn-sm" @click="openDocDetail(doc)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        Detail
                      </button>
                      <button v-else class="btn btn-primary btn-sm" @click="openAddVersion(doc.name)">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        {{ activeTab === 'employment' ? 'Tambah SK' : 'Upload' }}
                      </button>
                    </td>
                  </tr>

                  <!-- Expanded Versions -->
                  <tr v-if="doc.isMultiple && expandedSK === doc.name" class="versions-row">
                    <td colspan="4" style="padding:0">
                      <div class="versions-container">
                        <table class="versions-table">
                          <thead>
                            <tr>
                              <th>Versi</th>
                              <th>Jenis</th>
                              <th>Nomor Surat</th>
                              <th>Tanggal</th>
                              <th>File</th>
                              <th style="text-align:right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr v-for="ver in doc.versions" :key="ver.id">
                              <td><span class="version-badge">v{{ ver.version }}</span></td>
                              <td>{{ ver.subType || '-' }}</td>
                              <td>{{ ver.number || '-' }}</td>
                              <td>{{ ver.date || '-' }}</td>
                              <td>
                                <span v-if="ver.file" class="file-link" :title="ver.file" @click="viewVersionFile(ver)">
                                  {{ truncateFilename(ver.file) }}
                                </span>
                                <span v-else>-</span>
                              </td>
                              <td style="text-align:right">
                                <div class="version-actions">
                                  <button v-if="ver.filePath" class="btn btn-outline btn-xs" @click="viewVersionFile(ver)" title="Lihat file">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                                    View
                                  </button>
                                  <button v-if="ver.filePath" class="btn btn-success-outline btn-xs" @click="downloadVersionFile(ver)" title="Download file">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    Download
                                  </button>
                                  <button class="btn btn-danger-outline btn-xs" @click="handleDeleteVersion(doc.name, ver.id)">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    Hapus
                                  </button>
                                </div>
                              </td>
                            </tr>
                            <tr v-if="doc.versions.length === 0">
                              <td colspan="6" style="text-align:center; padding:16px; color:var(--text-secondary); font-style:italic">
                                Belum ada versi yang diupload
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Document Detail Modal -->
    <DocumentDetailModal
      v-if="showDetailModal"
      :document="selectedDocument"
      :employee-id="employeeId"
      :employee-name="employee.name"
      @close="showDetailModal = false"
      @upload="openUploadFromDetail"
      @delete="handleDelete"
      @mark-na="handleMarkNA"
      @unlock-na="handleUnlockNA"
    />

    <!-- SK File Preview Modal -->
    <div v-if="showFilePreview" class="modal-overlay" @click.self="showFilePreview = false">
      <div class="file-preview-modal">
        <div class="file-preview-header">
          <h3>{{ previewFile.title }}</h3>
          <div class="file-preview-header-actions">
            <button class="btn btn-success-outline btn-sm" @click="downloadVersionFile(previewFile)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download
            </button>
            <button class="btn btn-outline btn-sm" @click="showFilePreview = false">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>
        <div class="file-preview-body">
          <img v-if="previewFile.isImage" :src="previewFile.url" :alt="previewFile.title" class="preview-image" />
          <iframe v-else-if="previewFile.isPdf" :src="previewFile.url" class="preview-pdf"></iframe>
          <div v-else class="preview-unsupported">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            <p>Preview tidak tersedia untuk tipe file ini.</p>
            <button class="btn btn-primary btn-sm" @click="downloadVersionFile(previewFile)">Download File</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Upload Modal -->
    <UploadDocumentModal
      v-if="showUploadModal"
      :document-name="uploadDocName"
      :sub-types="uploadSubTypes"
      @close="showUploadModal = false"
      @uploaded="handleUpload"
    />
  </div>

  <!-- Not Found -->
  <div v-else class="not-found">
    <h2>Employee Not Found</h2>
    <p>The employee with ID {{ employeeId }} could not be found.</p>
    <router-link to="/e-dossier" class="btn btn-primary">Back to E-Dossier</router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useDossierStore } from '../stores/dossierStore'
import DocumentTable from '../components/DocumentTable.vue'
import DocumentDetailModal from '../components/modals/DocumentDetailModal.vue'
import UploadDocumentModal from '../components/modals/UploadDocumentModal.vue'

const props = defineProps({
  employeeId: { type: String, required: true }
})

const store = useDossierStore()

const employee = computed(() => store.getEmployee(props.employeeId))
const docs = computed(() => store.getEmployeeDocs(props.employeeId))
const docStats = computed(() => store.getEmployeeDocStats(props.employeeId))

const isLoading = ref(true)

async function fetchData(id) {
  isLoading.value = true
  
  // Always refresh document categories to pick up any admin changes
  await store.fetchDocumentCategories()
  
  const currentEmp = store.getEmployee(id)
  
  if (!currentEmp) {
    await store.fetchEmployee(id)
  }
  
  const fetchedEmp = store.getEmployee(id)
  if (fetchedEmp) {
    await store.fetchEmployeeDocs(id)
  }
  isLoading.value = false
}

onMounted(() => {
  fetchData(props.employeeId)
})

watch(() => props.employeeId, (newId) => {
  if (newId) {
    fetchData(newId)
  }
})

const initials = computed(() => {
  if (!employee.value) return ''
  return employee.value.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
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
const avatarGradient = computed(() => {
  if (!employee.value) return avatarColors[0]
  return avatarColors[parseInt(employee.value.id) % avatarColors.length]
})

const ringColor = computed(() => {
  if (docStats.value.percentage === 100) return '#10b981'
  if (docStats.value.percentage >= 70) return '#f59e0b'
  return '#ef4444'
})
const circumference = 2 * Math.PI * 34
const ringDash = computed(() => {
  const filled = (docStats.value.percentage / 100) * circumference
  return `${filled} ${circumference - filled}`
})

// Tabs
const tabs = [
  { key: 'identity', label: 'Identity' },
  { key: 'family', label: 'Family' },
  { key: 'education', label: 'Education' },
  { key: 'employment', label: 'Employee Letters' }
]
const activeTab = ref('identity')

const currentDocuments = computed(() => {
  if (!docs.value) return []
  return docs.value[activeTab.value] || []
})

function getTabCount(key) {
  if (!docs.value || !docs.value[key]) return 0
  return docs.value[key].filter(d => d.status === 'complete').length + '/' + docs.value[key].length
}

// Modals
const showDetailModal = ref(false)
const showUploadModal = ref(false)
const selectedDocument = ref(null)
const uploadDocName = ref('')
const uploadCategory = ref('')
const expandedSK = ref(null)
const isAddingVersion = ref(false)

// Toast State
const showToast = ref(false)
const toastMessage = ref('')
let toastTimer = null

function displayToast(msg) {
  toastMessage.value = msg
  showToast.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => showToast.value = false, 3000)
}

const uploadSubTypes = computed(() => {
  const catInfo = store.documentCategories[uploadCategory.value]
  if (catInfo && catInfo.subTypes && catInfo.subTypes[uploadDocName.value]) {
    return catInfo.subTypes[uploadDocName.value]
  }
  return []
})

function toggleExpand(name) {
  expandedSK.value = expandedSK.value === name ? null : name
}

function openDocDetail(doc) {
  selectedDocument.value = doc
  uploadCategory.value = activeTab.value
  showDetailModal.value = true
}

function openUploadFromDetail(doc) {
  showDetailModal.value = false
  uploadDocName.value = doc.name
  uploadCategory.value = activeTab.value
  isAddingVersion.value = false
  console.log('openUploadFromDetail', { docName: doc.name, category: activeTab.value })
  showUploadModal.value = true
}

function openAddVersion(docName) {
  uploadDocName.value = docName
  uploadCategory.value = activeTab.value
  isAddingVersion.value = true
  console.log('openAddVersion', { docName, category: activeTab.value })
  showUploadModal.value = true
}

async function handleUpload(data) {
  const payload = {
    name: data.file?.name || uploadDocName.value,
    number: data.number,
    date: data.date,
    subType: data.subType || null
  }

  if (isAddingVersion.value) {
    await store.addNewVersion(props.employeeId, uploadCategory.value, uploadDocName.value, payload, data.file)
  } else {
    await store.uploadDocument(props.employeeId, uploadCategory.value, uploadDocName.value, payload, data.file)
  }
  
  await store.fetchEmployeeDocs(props.employeeId)
  showUploadModal.value = false
  isAddingVersion.value = false
  
  // Show successful upload notification
  displayToast('Employee document has been uploaded successfully!')
}

function handleDeleteVersion(docName, versionId) {
  store.deleteVersion(props.employeeId, activeTab.value, docName, versionId)
}

function handleDelete(doc) {
  store.deleteDocument(props.employeeId, activeTab.value, doc.name)
  showDetailModal.value = false
}

function handleMarkNA(doc) {
  store.markDocOptional(props.employeeId, activeTab.value, doc.name)
  showDetailModal.value = false
}

function handleUnlockNA(doc) {
  store.unlockDocOptional(props.employeeId, activeTab.value, doc.name)
  showDetailModal.value = false
}

// ── SK File View/Download ──
const showFilePreview = ref(false)
const previewFile = ref({ url: '', title: '', isImage: false, isPdf: false, filePath: '' })

function getFileUrl(filePath) {
  if (!filePath) return ''
  // Use relative path so Vite proxy handles it
  return filePath.startsWith('/') ? filePath : '/' + filePath
}

function getFileType(filePath) {
  if (!filePath) return { isImage: false, isPdf: false }
  const ext = filePath.split('.').pop().toLowerCase()
  return {
    isImage: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'].includes(ext),
    isPdf: ext === 'pdf'
  }
}

function viewVersionFile(ver) {
  const url = getFileUrl(ver.filePath)
  if (!url) return
  const { isImage, isPdf } = getFileType(ver.filePath)
  previewFile.value = {
    url,
    title: ver.file || ver.subType || 'Document',
    isImage,
    isPdf,
    filePath: ver.filePath
  }
  showFilePreview.value = true
}

function downloadVersionFile(ver) {
  const url = getFileUrl(ver.filePath)
  if (!url) return
  const a = document.createElement('a')
  a.href = url
  a.download = ver.file || ver.title || 'document'
  a.target = '_blank'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

function truncateFilename(name) {
  if (!name) return '-'
  if (name.length <= 30) return name
  const ext = name.split('.').pop()
  return name.substring(0, 25) + '...' + ext
}
</script>

<style scoped>
/* ── Toast Notification ── */
.toast-notification {
  position: fixed;
  top: 24px;
  right: 24px;
  background: white;
  border-left: 4px solid #10b981;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  border-radius: 8px;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  z-index: 9999;
}
.toast-icon {
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
}
.toast-content h4 {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 0.95rem;
  font-weight: 700;
}
.toast-content p {
  margin: 0;
  color: #64748b;
  font-size: 0.85rem;
}
.toast-enter-active, .toast-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.toast-enter-from, .toast-leave-to {
  opacity: 0;
  transform: translateX(50px);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  color: #006297;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  background: #ffffff;
  border: 1px solid #006297;
}
.back-btn:hover {
  background: #006297;
  color: #ffffff;
  border-color: #006297;
  box-shadow: 0 4px 12px rgba(14,165,233,0.3);
}
.back-btn:hover svg { stroke: #ffffff; }
.profile-card {
  margin-bottom: 16px;
}
.profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
}
.profile-left {
  display: flex;
  align-items: center;
  gap: 20px;
}
.profile-avatar {
  width: 80px;
  height: 80px;
  min-width: 80px;
  min-height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 800;
  font-size: 1.4rem;
  flex-shrink: 0;
  overflow: hidden;
}
.profile-avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.profile-avatar-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.profile-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}
.profile-meta {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.meta-chip {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  background: var(--surface-variant);
  border-radius: 50px;
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.profile-right {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.completion-ring {
  position: relative;
  width: 80px;
  height: 80px;
}
.ring-svg {
  width: 80px;
  height: 80px;
}
.ring-value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text);
}
.completion-label {
  font-size: 0.72rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.alert {
  margin-bottom: 16px;
}

.tabs-container {
  overflow: hidden;
}
.tabs {
  padding: 0 1.5rem;
}
.tab-count {
  font-size: 0.7rem;
  background: var(--surface-variant);
  padding: 1px 7px;
  border-radius: 50px;
  margin-left: 6px;
  font-weight: 700;
  color: var(--text-secondary);
}
.tab-item.active .tab-count {
  background: rgba(0,98,151,.1);
  color: var(--primary);
}
.tab-content {
  padding: 1.5rem;
}

.sk-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.sk-header h4 {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}
.version-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 10px;
  background: linear-gradient(135deg, rgba(0,98,151,.1), rgba(0,98,151,.05));
  color: var(--primary);
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 700;
}
.doc-table-wrap {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.not-found {
  text-align: center;
  padding: 80px 20px;
}
.not-found h2 {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 8px;
}
.not-found p {
  color: var(--text-secondary);
  margin-bottom: 20px;
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: var(--text-secondary);
}
.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--border);
  border-top-color: var(--primary);
  border-radius: 50%;
  animation: spinner 1s linear infinite;
  margin-bottom: 16px;
}
@keyframes spinner {
  to { transform: rotate(360deg); }
}

/* Expandable SK Rows */
.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all 0.2s;
}
.expand-btn:hover { background: var(--sidebar-bg); color: var(--primary); }
.expand-btn svg { transition: transform 0.3s ease; }
.expand-btn svg.rotated { transform: rotate(180deg); }
.sk-main-row.expanded { background: rgba(0,98,151,.03); }
.doc-name-label { font-weight: 500; }
.version-count {
  font-size: 0.75rem; color: var(--text-secondary); margin-left: 8px;
  font-weight: 400;
}
.versions-container {
  background: linear-gradient(135deg, rgba(0,98,151,.02), rgba(0,98,151,.01));
  border-top: 1px solid var(--border);
  padding: 12px 16px 12px 48px;
}
.versions-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}
.versions-table th {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-secondary);
  font-weight: 600;
  padding: 6px 10px;
  border-bottom: 1px solid var(--border);
}
.versions-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(0,0,0,.04);
  color: var(--text);
}
.btn-danger-outline {
  border: 1px solid #fca5a5;
  color: #ef4444;
  background: white;
  border-radius: 6px;
  padding: 3px 10px;
  font-size: 0.72rem;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s;
}
.btn-danger-outline:hover {
  background: #fef2f2;
  border-color: #ef4444;
}
.btn-xs { padding: 3px 8px; font-size: 0.72rem; }

/* ── Version Actions ── */
.version-actions { display: flex; gap: 6px; justify-content: flex-end; flex-wrap: wrap; }
.btn-success-outline {
  border: 1px solid #86efac; color: #22c55e; background: white;
  border-radius: 6px; padding: 3px 10px; font-size: 0.72rem; font-weight: 500;
  cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.2s;
}
.btn-success-outline:hover { background: #f0fdf4; border-color: #22c55e; }
.file-link {
  color: #006297; cursor: pointer; text-decoration: underline;
  font-size: 0.8rem; word-break: break-all;
}
.file-link:hover { color: #004a73; }

/* ── File Preview Modal ── */
.file-preview-modal {
  background: var(--surface, #fff); border-radius: 16px;
  width: 90vw; max-width: 900px; max-height: 90vh;
  box-shadow: 0 25px 50px rgba(0,0,0,0.25); display: flex; flex-direction: column;
  overflow: hidden;
}
.file-preview-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px; border-bottom: 1px solid var(--border, #e2e8f0);
}
.file-preview-header h3 { margin: 0; font-size: 1rem; font-weight: 600; color: var(--text); }
.file-preview-header-actions { display: flex; gap: 8px; align-items: center; }
.file-preview.card-body {
  padding: 24px;
}
.row-na { opacity: 0.6; }
.text-na { color: #94a3b8; text-decoration: line-through; }
.file-preview-body {
  padding: 24px; flex: 1; overflow: auto; display: flex;
  justify-content: center; align-items: center; min-height: 400px;
  background: var(--bg, #f1f5f9);
}
.preview-image { max-width: 100%; max-height: 70vh; border-radius: 8px; object-fit: contain; }
.preview-pdf { width: 100%; height: 70vh; border: none; border-radius: 8px; }
.preview-unsupported {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  color: var(--text-secondary, #94a3b8); text-align: center;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .profile-row {
    flex-direction: column;
    align-items: flex-start;
  }
  .profile-right {
    flex-direction: row;
    align-items: center;
    gap: 12px;
    width: 100%;
    justify-content: center;
  }
  .profile-avatar {
    width: 60px;
    height: 60px;
    min-width: 60px;
    min-height: 60px;
    font-size: 1.1rem;
  }
  .profile-name {
    font-size: 1.1rem;
  }
  .meta-chip {
    font-size: 0.72rem;
    padding: 3px 8px;
  }
  .completion-ring {
    width: 60px;
    height: 60px;
  }
  .ring-svg {
    width: 60px;
    height: 60px;
  }
  .ring-value {
    font-size: 0.9rem;
  }
  .doc-table-wrap {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .versions-container {
    padding: 8px;
    overflow-x: auto;
  }
  .tab-content {
    padding: 1rem;
  }
  .tabs {
    padding: 0 1rem;
  }
  .toast-notification {
    top: 12px;
    right: 12px;
    left: 12px;
    padding: 12px 16px;
  }
  .file-preview-modal {
    width: 95vw;
  }
  .file-preview-body {
    padding: 12px;
    min-height: 250px;
  }
}
</style>
