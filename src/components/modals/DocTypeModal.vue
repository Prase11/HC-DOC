<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content doctype-modal">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            {{ isEdit ? 'Edit Document Type' : 'Add Document Type' }}
          </h3>
          <button class="modal-close-btn" @click="$emit('close')">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Document Name <span class="required">*</span></label>
            <input v-model="form.name" type="text" class="form-input" placeholder="e.g. Paspor" />
          </div>

          <div class="form-group">
            <label class="form-label">Category <span class="required">*</span></label>
            <select v-model="form.doc_group" class="form-input">
              <option value="" disabled>Select category</option>
              <option value="identity">Identity</option>
              <option value="family">Family</option>
              <option value="education">Education</option>
              <option value="employee_letters">Employee Letters</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Required</label>
            <div class="toggle-row">
              <button class="toggle-btn" :class="{ active: form.is_required }" @click="form.is_required = !form.is_required">
                <span class="toggle-knob"></span>
              </button>
              <span class="toggle-label">{{ form.is_required ? 'Required' : 'Optional' }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Multiple Data</label>
            <div class="toggle-row">
              <button class="toggle-btn" :class="{ active: form.is_multiple }" @click="form.is_multiple = !form.is_multiple">
                <span class="toggle-knob"></span>
              </button>
              <span class="toggle-label">{{ form.is_multiple ? 'Bisa upload banyak versi (Tambah SK)' : 'Hanya 1 file per karyawan' }}</span>
            </div>
          </div>

          <!-- NEW SECTION FOR LETTER TYPES -->
          <div class="form-group" v-if="form.is_multiple">
            <label class="form-label">Jenis Surat (Letter Types)</label>
            <div class="letter-types-list">
              <div v-for="(type, index) in form.letter_types" :key="index" class="letter-type-tag">
                {{ type }}
                <button class="btn-remove-tag" @click.prevent="removeLetterType(index)">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>
              </div>
            </div>
            <div class="letter-type-input">
              <input v-model="newLetterType" @keydown.enter.prevent="addLetterType" type="text" class="form-input" placeholder="e.g. Mutasi Dinas" />
              <button class="btn btn-primary" style="padding: 0 16px;" @click.prevent="addLetterType">Add</button>
            </div>
            <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px;">Tambahkan jenis surat yang bisa dipilih saat upload (tekan Enter untuk menambah).</p>
          </div>

          <p v-if="error" class="form-error">{{ error }}</p>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')" :disabled="saving">Cancel</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="saving || !form.name || !form.doc_group">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Saving...' : (isEdit ? 'Update' : 'Create') }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed } from 'vue'
import { apiFetch } from '../../utils/api.js'

const props = defineProps({
  docType: { type: Object, default: null }
})
const emit = defineEmits(['close', 'saved'])

const isEdit = computed(() => !!props.docType)

const form = ref({
  name: props.docType?.name || '',
  doc_group: props.docType?.doc_group || '',
  is_required: props.docType ? props.docType.is_required : true,
  is_multiple: props.docType ? props.docType.is_multiple : false,
  letter_types: props.docType?.letter_types ? [...props.docType.letter_types] : []
})

const newLetterType = ref('')

function addLetterType() {
  const lt = newLetterType.value.trim()
  if (lt && !form.value.letter_types.includes(lt)) {
    form.value.letter_types.push(lt)
  }
  newLetterType.value = ''
}

function removeLetterType(index) {
  form.value.letter_types.splice(index, 1)
}

const saving = ref(false)
const error = ref('')

async function handleSave() {
  error.value = ''
  saving.value = true

  // Auto-add any pending text in the letter type input
  if (newLetterType.value.trim()) {
    addLetterType()
  }

  try {
    const url = isEdit.value ? `/api/doctypes/${props.docType.id}` : '/api/doctypes'
    const method = isEdit.value ? 'PUT' : 'POST'
    const res = await apiFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.value)
    })
    const json = await res.json()
    if (json.success) {
      emit('saved')
    } else {
      error.value = json.message || 'Failed to save'
    }
  } catch (e) {
    error.value = 'Network error'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.doctype-modal { max-width: 480px; }

.form-group { margin-bottom: 18px; }
.form-label {
  display: block;
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text);
  margin-bottom: 6px;
}
.required { color: #ef4444; }
.form-input {
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  font-size: 0.88rem;
  background: var(--surface);
  color: var(--text);
  transition: border-color 0.2s;
  box-sizing: border-box;
}
.form-input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.letter-types-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}
.letter-type-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  background: var(--surface-variant);
  border: 1px solid var(--border);
  border-radius: 50px;
  font-size: 0.8rem;
  color: var(--text);
}
.btn-remove-tag {
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}
.btn-remove-tag:hover {
  background: #fee2e2;
  color: #ef4444;
}
.letter-type-input {
  display: flex;
  gap: 8px;
}
.letter-type-input .form-input {
  flex: 1;
}

.toggle-row { display: flex; align-items: center; gap: 10px; }
.toggle-btn {
  width: 44px; height: 24px;
  border-radius: 12px;
  border: none;
  background: var(--border);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
  padding: 0;
}
.toggle-btn.active { background: var(--primary); }
.toggle-knob {
  position: absolute;
  top: 3px; left: 3px;
  width: 18px; height: 18px;
  border-radius: 50%;
  background: #fff;
  transition: transform 0.2s;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}
.toggle-btn.active .toggle-knob { transform: translateX(20px); }
.toggle-label { font-size: 0.82rem; color: var(--text-secondary); }

.form-error {
  color: #ef4444;
  font-size: 0.82rem;
  margin-top: 8px;
  padding: 8px 12px;
  background: #fef2f2;
  border-radius: var(--radius);
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
</style>
