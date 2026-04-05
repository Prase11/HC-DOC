<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content modal-detail">
        <!-- Header -->
        <div class="modal-header">
          <div class="modal-title-group">
            <h3 class="modal-title">{{ document.name }}</h3>
            <span class="modal-subtitle">{{ employeeName }}</span>
          </div>
          <div class="modal-header-right">
            <StatusBadge :status="document.status" />
            <button class="btn-close" @click="$emit('close')">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        <!-- Body -->
        <div class="modal-body-split">
          <!-- Main content -->
          <div class="modal-main">
            <!-- Complete State -->
            <div v-if="document.status === 'complete'" class="doc-complete">
              <div class="doc-preview">
                <!-- Real file preview -->
                <div v-if="fileUrl" class="file-preview-area">
                  <iframe v-if="fileType === 'pdf'" :src="fileUrl" class="preview-iframe" />
                  <img v-else-if="fileType === 'image'" :src="fileUrl" class="preview-image" />
                </div>
                <!-- No file placeholder -->
                <div v-else class="pdf-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#006297" stroke-width="1.5" stroke-linecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                  <p class="preview-label">Metadata only — No file uploaded</p>
                </div>
              </div>
              <div class="doc-meta">
                <div class="meta-row" v-if="document.number">
                  <span class="meta-label">Document Number</span>
                  <span class="meta-value">{{ document.number }}</span>
                </div>
                <div class="meta-row" v-if="document.date">
                  <span class="meta-label">Document Date</span>
                  <span class="meta-value">{{ document.date }}</span>
                </div>
                <div class="meta-row" v-if="document.file">
                  <span class="meta-label">File Name</span>
                  <span class="meta-value">{{ document.file }}</span>
                </div>
              </div>
              <div class="doc-actions">
                <a v-if="fileUrl" :href="fileUrl" target="_blank" class="btn btn-primary">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  Preview Full
                </a>
                <button v-if="fileUrl" class="btn btn-download" @click="downloadFile" :disabled="downloading">
                  <svg v-if="!downloading" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  <span v-else class="spinner" style="width:14px;height:14px;border-width:2px"></span>
                  {{ downloading ? 'Downloading...' : 'Download' }}
                </button>
                <button class="btn btn-outline" @click="$emit('upload', document)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
                  Replace
                </button>
                <button class="btn btn-danger" @click="showDeleteConfirm = true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                  Hapus
                </button>
              </div>
            </div>

            <!-- Incomplete State -->
            <div v-else-if="document.status === 'incomplete'" class="doc-incomplete">
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-linecap="round">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="12" y1="9" x2="12.01" y2="9"/>
                  </svg>
                </div>
                <h4>Document has not been uploaded</h4>
                <p>This document is required. Please upload or mark as N/A if not applicable.</p>
                <div class="empty-actions">
                  <button class="btn btn-primary" @click="$emit('upload', document)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload Document
                  </button>
                  <button class="btn btn-na" @click="$emit('mark-na', document)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>
                    Tandai N/A
                  </button>
                </div>
              </div>
            </div>

            <!-- N/A / Optional State -->
            <div v-else class="doc-optional">
              <div class="empty-state">
                <div class="empty-icon">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                  </svg>
                </div>
                <h4>Dokumen ini ditandai sebagai N/A</h4>
                <p>Dokumen ini tidak diperlukan untuk karyawan ini dan tidak dihitung dalam persentase kelengkapan.</p>
                <button class="btn btn-unlock" @click="$emit('unlock-na', document)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 019.9-1"/></svg>
                  Buka Kembali (Unlock)
                </button>
              </div>
            </div>
          </div>

          <!-- Right Sidebar — Activity -->
          <div class="modal-sidebar">
            <h4 class="sidebar-title">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Activity History
            </h4>
            <ActivityTimeline :items="activityItems" />
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Overlay -->
    <div v-if="showDeleteConfirm" class="modal-overlay confirm-overlay" @click.self="showDeleteConfirm = false">
      <div class="confirm-box">
        <div class="confirm-icon">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <h3 class="confirm-title">Hapus Dokumen?</h3>
        <p class="confirm-text">Apakah kamu yakin ingin menghapus <strong>{{ document.name }}</strong>? Dokumen akan direset ke status Incomplete.</p>
        <div class="confirm-actions">
          <button class="btn btn-outline" @click="showDeleteConfirm = false">Batal</button>
          <button class="btn btn-danger" @click="doDelete">Ya, Hapus</button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import StatusBadge from '../StatusBadge.vue'
import ActivityTimeline from '../ActivityTimeline.vue'
import { useDossierStore } from '../../stores/dossierStore'

const props = defineProps({
  document: { type: Object, required: true },
  employeeId: { type: String, required: true },
  employeeName: { type: String, default: '' }
})

const emit = defineEmits(['close', 'upload', 'delete', 'mark-na', 'unlock-na'])

const store = useDossierStore()
const showDeleteConfirm = ref(false)
const downloading = ref(false)

const fileUrl = computed(() => {
  if (props.document.filePath) {
    let normalized = props.document.filePath.replace(/\\/g, '/')
    if (!normalized.startsWith('/')) normalized = '/' + normalized
    if (import.meta.env.VITE_API_URL) {
      const baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')
      return `${baseUrl}${normalized}`
    }
    // Use relative path for local development to leverage Vite proxy 
    // and avoid Cross-Origin-Resource-Policy blocks from helmet
    return normalized
  }
  return null
})

const fileType = computed(() => {
  const fp = fileUrl.value
  if (!fp) return null
  const lower = fp.toLowerCase()
  if (lower.endsWith('.pdf')) return 'pdf'
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png')) return 'image'
  return 'other'
})

const activityItems = computed(() => {
  return store.getDocumentActivity(props.employeeId, props.document.name)
})

function doDelete() {
  emit('delete', props.document)
  showDeleteConfirm.value = false
  setTimeout(() => store.fetchActivities(), 500)
}

async function downloadFile() {
  if (!fileUrl.value || downloading.value) return
  downloading.value = true
  try {
    const fileName = props.document.file || props.document.name || 'document'
    // Build download URL with proper query params
    let baseUrl = ''
    if (import.meta.env.VITE_API_URL) {
      baseUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')
    }
    const downloadUrl = `${baseUrl}/api/download?path=${encodeURIComponent(props.document.filePath)}&name=${encodeURIComponent(fileName)}`
    
    const a = window.document.createElement('a')
    a.href = downloadUrl
    a.download = fileName
    window.document.body.appendChild(a)
    a.click()
    a.remove()
  } catch (e) {
    console.error('Download failed:', e)
    window.open(fileUrl.value, '_blank')
  } finally {
    downloading.value = false
  }
}

onMounted(() => {
  store.fetchActivities()
})
</script>

<style scoped>
.modal-detail {
  max-width: 950px;
}
.modal-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text);
}
.modal-subtitle {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.modal-header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.btn-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border: none;
  background: none;
  color: var(--text-secondary);
  cursor: pointer;
  border-radius: var(--radius);
  transition: all 0.2s;
}
.btn-close:hover { background: #f1f5f9; color: var(--text); }

.modal-body-split {
  display: flex;
  min-height: 380px;
}
.modal-main {
  flex: 1;
  padding: 1.5rem;
}
.modal-sidebar {
  width: 280px;
  border-left: 1px solid var(--border);
  padding: 1.5rem;
  background: var(--surface-variant);
  border-radius: 0 0 var(--radius-xl) 0;
}
.sidebar-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--border);
}

/* Preview */
.doc-preview {
  margin-bottom: 20px;
}
.file-preview-area {
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: #f8fafc;
}
.preview-iframe {
  width: 100%;
  min-height: 400px;
  border: none;
  display: block;
}
.preview-image {
  width: 100%;
  max-height: 400px;
  object-fit: contain;
  display: block;
  background: #f1f5f9;
}
.pdf-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  text-align: center;
}
.preview-label {
  margin-top: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}
.preview-filename {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 2px;
}
.doc-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
  padding: 14px;
  background: var(--surface-variant);
  border-radius: var(--radius);
}
.meta-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
}
.meta-label { color: var(--text-secondary); }
.meta-value { font-weight: 600; color: var(--text); }
.doc-actions {
  display: flex;
  gap: 10px;
}

/* Buttons */
.btn-danger {
  background: #fee2e2;
  color: #dc2626;
  border: 1px solid #fca5a5;
}
.btn-danger:hover {
  background: #dc2626;
  color: #fff;
}
.btn-na {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}
.btn-na:hover {
  background: #64748b;
  color: #fff;
}
.btn-download {
  background: #e0f2fe;
  color: #0284c7;
  border: 1px solid #7dd3fc;
}
.btn-download:hover {
  background: #0284c7;
  color: #fff;
}
.btn-download:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-unlock {
  background: #dbeafe;
  color: #2563eb;
  border: 1px solid #93c5fd;
}
.btn-unlock:hover {
  background: #2563eb;
  color: #fff;
}

/* Empty states */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 20px;
}
.empty-icon { margin-bottom: 16px; }
.empty-state h4 {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.empty-state p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
  max-width: 320px;
}
.empty-actions {
  display: flex;
  gap: 10px;
}

/* ── Delete Confirmation ── */
.confirm-overlay {
  z-index: 1100;
}
.confirm-box {
  background: #fff;
  border-radius: 16px;
  padding: 32px;
  max-width: 400px;
  width: 90%;
  text-align: center;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
  animation: scaleIn .2s ease;
}
.confirm-icon {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}
.confirm-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}
.confirm-text {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin-bottom: 24px;
}
.confirm-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
}
.confirm-actions .btn {
  padding: 8px 24px;
  font-weight: 600;
}

@keyframes scaleIn { from { transform: scale(.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }

@media (max-width: 768px) {
  .modal-body-split { flex-direction: column; }
  .modal-sidebar { width: 100%; border-left: none; border-top: 1px solid var(--border); }
}
</style>
