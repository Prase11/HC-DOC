<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content settings-modal">
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            Settings — Import Data
          </h3>
          <button class="btn-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Step 1: Upload -->
          <div v-if="step === 'upload'" class="upload-step">
            <h4 class="step-title">Import Data Karyawan via CSV</h4>
            <p class="step-desc">Upload file CSV berisi data karyawan. Format yang didukung: <code>.csv</code> (comma atau semicolon separated).</p>

            <div class="csv-format-guide">
              <h5>📋 Format CSV yang diharapkan:</h5>
              <div class="csv-example">
                <code>employee_id,name,unit,position</code><br>
                <code>900001,Ahmad Rizki Maulana,THS-1,Software Engineer</code><br>
                <code>900002,Budi Santoso,THS-2,Lead Engineer</code>
              </div>
              <p class="guide-note">* Kolom <strong>employee_id</strong> dan <strong>name</strong> wajib. Kolom lain opsional.</p>
            </div>

            <div
              class="drop-zone"
              :class="{ dragging: isDragging }"
              @dragover.prevent="isDragging = true"
              @dragleave="isDragging = false"
              @drop.prevent="handleDrop"
              @click="$refs.fileInput.click()"
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="1.5" stroke-linecap="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <p class="drop-text">Drag & drop CSV file di sini</p>
              <p class="drop-sub">atau klik untuk browse</p>
              <input ref="fileInput" type="file" accept=".csv" hidden @change="handleFileSelect" />
            </div>

            <div v-if="error" class="alert alert-warning" style="margin-top: 16px">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              {{ error }}
            </div>
          </div>

          <!-- Step 2: Preview & Mapping -->
          <div v-if="step === 'preview'" class="preview-step">
            <div class="preview-header">
              <h4 class="step-title">Preview: {{ previewData.filename }}</h4>
              <span class="row-count badge badge-info">{{ previewData.totalRows }} baris</span>
            </div>

            <div class="mapping-section">
              <h5>🔗 Column Mapping</h5>
              <div class="mapping-grid">
                <div class="mapping-item" v-for="field in mappingFields" :key="field.key">
                  <label>{{ field.label }} {{ field.required ? '*' : '' }}</label>
                  <select v-model="columnMapping[field.key]" class="form-select">
                    <option :value="-1">— Skip —</option>
                    <option v-for="(header, idx) in previewData.headers" :key="idx" :value="idx">
                      {{ header }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div class="table-scroll">
              <table class="data-table preview-table">
                <thead>
                  <tr>
                    <th v-for="(header, idx) in previewData.headers" :key="idx">{{ header }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, idx) in previewData.rows.slice(0, 10)" :key="idx">
                    <td v-for="(cell, cIdx) in row" :key="cIdx">{{ cell }}</td>
                  </tr>
                </tbody>
              </table>
              <p v-if="previewData.totalRows > 10" class="more-rows">
                ... dan {{ previewData.totalRows - 10 }} baris lainnya
              </p>
            </div>

            <div class="preview-actions">
              <button class="btn btn-ghost" @click="resetUpload">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
                Kembali
              </button>
              <button class="btn btn-primary" @click="confirmImport" :disabled="importing">
                <svg v-if="!importing" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                <span v-if="importing" class="spinner"></span>
                {{ importing ? 'Importing...' : `Import ${previewData.totalRows} Karyawan` }}
              </button>
            </div>
          </div>

          <!-- Step 3: Result -->
          <div v-if="step === 'result'" class="result-step">
            <div class="result-icon success">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h4 class="result-title">Import Berhasil! 🎉</h4>
            <p class="result-text">{{ importResult.message }}</p>
            <div class="result-stats">
              <div class="stat-item"><span class="stat-num">{{ importResult.inserted }}</span><span class="stat-label">Baru</span></div>
              <div class="stat-item"><span class="stat-num">{{ importResult.updated }}</span><span class="stat-label">Diupdate</span></div>
              <div class="stat-item"><span class="stat-num">{{ importResult.total }}</span><span class="stat-label">Total</span></div>
            </div>
            <button class="btn btn-primary" @click="$emit('close')">Selesai</button>
          </div>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { apiFetch } from '../../utils/api.js';
import { ref } from 'vue'

defineEmits(['close', 'imported'])

const step = ref('upload')
const isDragging = ref(false)
const error = ref('')
const importing = ref(false)
const previewData = ref({})
const importResult = ref({})

const mappingFields = [
  { key: 'employee_id', label: 'Employee ID', required: true },
  { key: 'name', label: 'Nama', required: true },
  { key: 'unit', label: 'Unit', required: false },
  { key: 'position', label: 'Posisi/Jabatan', required: false }
]

const columnMapping = ref({
  employee_id: 0,
  name: 1,
  unit: -1,
  position: -1
})

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file) uploadFile(file)
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file) uploadFile(file)
}

async function uploadFile(file) {
  if (!file.name.endsWith('.csv')) {
    error.value = 'Hanya file CSV yang diperbolehkan'
    return
  }
  error.value = ''

  const formData = new FormData()
  formData.append('file', file)

  try {
    const res = await apiFetch('/api/import/csv', { method: 'POST', body: formData })
    const json = await res.json()
    if (json.success) {
      previewData.value = json.data
      autoMapColumns(json.data.headers)
      step.value = 'preview'
    } else {
      error.value = json.message || 'Failed to parse CSV'
    }
  } catch (e) {
    error.value = 'Gagal upload file: ' + e.message
  }
}

function autoMapColumns(headers) {
  const lower = headers.map(h => h.toLowerCase().replace(/[^a-z0-9]/g, ''))
  const idAliases = ['employeeid', 'id', 'nik', 'nip', 'empid', 'no']
  const nameAliases = ['name', 'nama', 'employeename', 'fullname', 'namalengkap']
  const unitAliases = ['unit', 'department', 'divisi', 'dept', 'bagian']
  const posAliases = ['position', 'jabatan', 'posisi', 'title', 'jobtitle']

  columnMapping.value.employee_id = lower.findIndex(h => idAliases.some(a => h.includes(a)))
  columnMapping.value.name = lower.findIndex(h => nameAliases.some(a => h.includes(a)))
  columnMapping.value.unit = lower.findIndex(h => unitAliases.some(a => h.includes(a)))
  columnMapping.value.position = lower.findIndex(h => posAliases.some(a => h.includes(a)))

  if (columnMapping.value.employee_id < 0) columnMapping.value.employee_id = 0
  if (columnMapping.value.name < 0) columnMapping.value.name = 1
}

async function confirmImport() {
  importing.value = true
  try {
    const res = await apiFetch('/api/import/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rows: previewData.value.rows,
        mapping: columnMapping.value
      })
    })
    const json = await res.json()
    if (json.success) {
      importResult.value = json.data
      importResult.value.message = json.message
      step.value = 'result'
    } else {
      error.value = json.message
      step.value = 'upload'
    }
  } catch (e) {
    error.value = 'Gagal import: ' + e.message
    step.value = 'upload'
  } finally {
    importing.value = false
  }
}

function resetUpload() {
  step.value = 'upload'
  error.value = ''
  previewData.value = {}
}
</script>

<style scoped>
.settings-modal {
  max-width: 900px;
}
.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
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
.btn-close:hover { background: var(--surface-variant); color: var(--text); }

.step-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.step-desc {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.step-desc code {
  background: var(--surface-variant);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.8rem;
}

/* Format Guide */
.csv-format-guide {
  background: var(--surface-variant);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 18px;
  margin-bottom: 20px;
}
.csv-format-guide h5 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 8px;
}
.csv-example {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 10px 14px;
  font-family: 'Courier New', monospace;
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.7;
  overflow-x: auto;
}
.guide-note {
  font-size: 0.78rem;
  color: var(--text-secondary);
  margin-top: 8px;
}

/* Drop Zone */
.drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.drop-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
}
.drop-sub {
  font-size: 0.8rem;
  color: var(--text-secondary);
}

/* Preview */
.preview-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}
.mapping-section {
  margin-bottom: 16px;
}
.mapping-section h5 {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 10px;
}
.mapping-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}
.mapping-item label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 4px;
}
.mapping-item .form-select {
  padding: 6px 10px;
  font-size: 0.8rem;
}
.table-scroll {
  max-height: 260px;
  overflow: auto;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 16px;
}
.preview-table td {
  font-size: 0.8rem;
  white-space: nowrap;
}
.more-rows {
  text-align: center;
  font-size: 0.8rem;
  color: var(--text-secondary);
  padding: 8px;
}
.preview-actions {
  display: flex;
  justify-content: space-between;
}

/* Result */
.result-step {
  text-align: center;
  padding: 20px 0;
}
.result-icon {
  margin-bottom: 16px;
}
.result-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 6px;
}
.result-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 20px;
}
.result-stats {
  display: flex;
  justify-content: center;
  gap: 24px;
  margin-bottom: 24px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.stat-num {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--primary);
}
.stat-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
}

/* Spinner */
.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
