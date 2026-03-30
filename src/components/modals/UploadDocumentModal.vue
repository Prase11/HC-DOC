<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content modal-upload">
        <!-- Header -->
        <div class="modal-header">
          <h3 class="modal-title">Upload Document</h3>
          <button class="btn-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <!-- Body -->
        <div class="modal-body">
          <!-- Drop Zone -->
          <div
            class="drop-zone"
            :class="{ dragging: isDragging, 'has-file': selectedFile }"
            @dragover.prevent="isDragging = true"
            @dragleave="isDragging = false"
            @drop.prevent="handleDrop"
            @click="triggerFileInput"
          >
            <input
              ref="fileInput"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              style="display:none"
              @change="handleFileSelect"
            />
            <div v-if="!selectedFile" class="drop-content">
              <div class="drop-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="1.5" stroke-linecap="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="17 8 12 3 7 8"/>
                  <line x1="12" y1="3" x2="12" y2="15"/>
                </svg>
              </div>
              <p class="drop-text"><strong>Drag & Drop</strong> your file here</p>
              <p class="drop-subtext">or <span class="drop-link">browse files</span></p>
              <p class="drop-formats">Accepted: PDF, JPG, PNG</p>
            </div>
            <div v-else class="file-selected">
              <div class="file-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><polyline points="9 15 11 17 15 13"/></svg>
              </div>
              <div class="file-info">
                <span class="file-name">{{ selectedFile.name }}</span>
                <span class="file-size">{{ formatSize(selectedFile.size) }}</span>
              </div>
              <button class="btn-remove" @click.stop="removeFile" title="Remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
          </div>

          <!-- Validation error -->
          <div v-if="fileError" class="alert alert-warning" style="margin-top:12px">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            {{ fileError }}
          </div>

          <!-- Sub-type Dropdown -->
          <div v-if="subTypes && subTypes.length > 0" style="margin-top:20px">
            <div class="form-group">
              <label class="form-label">Jenis Surat *</label>
              <select v-model="selectedSubType" class="form-input">
                <option value="" disabled>— Pilih Jenis —</option>
                <option v-for="st in subTypes" :key="st" :value="st">{{ st }}</option>
              </select>
            </div>
          </div>

          <!-- Inputs -->
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-top:16px;">
            <div class="form-group">
              <label class="form-label">Document Number</label>
              <input v-model="docNumber" type="text" class="form-input" placeholder="e.g. 3201xxxx" />
            </div>
            <div class="form-group">
              <label class="form-label">Document Date</label>
              <input v-model="docDate" type="date" class="form-input" />
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')">Cancel</button>
          <button class="btn btn-primary" :disabled="!canUpload" @click="handleUpload">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Upload
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close', 'uploaded'])

const props = defineProps({
  documentName: { type: String, default: '' },
  subTypes: { type: Array, default: () => [] }
})

const fileInput = ref(null)
const selectedFile = ref(null)
const isDragging = ref(false)
const fileError = ref('')
const docNumber = ref('')
const docDate = ref('')
const selectedSubType = ref('')

const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
const maxSize = 10 * 1024 * 1024 // 10MB

function validateFile(file) {
  if (!allowedTypes.includes(file.type)) {
    fileError.value = 'Invalid file type. Only PDF, JPG, and PNG are accepted.'
    return false
  }
  if (file.size > maxSize) {
    fileError.value = 'File size exceeds 10MB limit.'
    return false
  }
  fileError.value = ''
  return true
}

function handleFileSelect(e) {
  const file = e.target.files[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

function handleDrop(e) {
  isDragging.value = false
  const file = e.dataTransfer.files[0]
  if (file && validateFile(file)) {
    selectedFile.value = file
  }
}

function triggerFileInput() {
  if (!selectedFile.value) fileInput.value?.click()
}

function removeFile() {
  selectedFile.value = null
  fileError.value = ''
  if (fileInput.value) fileInput.value.value = ''
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const canUpload = computed(() => {
  const hasData = selectedFile.value || docNumber.value || docDate.value
  const needsSubType = props.subTypes && props.subTypes.length > 0
  if (needsSubType && !selectedSubType.value) return false
  return hasData && !fileError.value
})

function handleUpload() {
  if (!canUpload.value) return
  emit('uploaded', {
    file: selectedFile.value,
    number: docNumber.value,
    date: docDate.value,
    subType: selectedSubType.value || null
  })
}
</script>

<style scoped>
.modal-upload {
  max-width: 720px;
}
.modal-title {
  font-size: 1.1rem;
  font-weight: 700;
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

.drop-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.drop-icon { margin-bottom: 8px; }
.drop-text { font-size: 0.95rem; color: var(--text); }
.drop-subtext { font-size: 0.85rem; color: var(--text-secondary); }
.drop-link { color: var(--primary); font-weight: 600; cursor: pointer; }
.drop-formats { font-size: 0.75rem; color: #94a3b8; margin-top: 8px; }

.file-selected {
  display: flex;
  align-items: center;
  gap: 14px;
}
.file-info {
  display: flex;
  flex-direction: column;
  flex: 1;
}
.file-name { font-size: 0.9rem; font-weight: 600; color: var(--text); }
.file-size { font-size: 0.78rem; color: var(--text-secondary); }
.btn-remove {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-remove:hover { background: #fecaca; }

.has-file { border-style: solid; border-color: #10b981; background: #f0fdf4; }

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
