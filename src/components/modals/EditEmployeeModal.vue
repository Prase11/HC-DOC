<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content edit-modal">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Karyawan
          </h3>
          <button class="btn-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Employee ID</label>
            <input class="form-input" v-model="form.employee_id" disabled />
            <span class="field-hint">ID tidak dapat diubah. Jika salah, hapus dan buat ulang.</span>
          </div>
          <div class="form-group">
            <label class="form-label">Nama Lengkap *</label>
            <input class="form-input" v-model="form.name" placeholder="Nama karyawan" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Unit / Departemen</label>
              <input class="form-input" v-model="form.unit" placeholder="e.g. THS-1" />
            </div>
            <div class="form-group">
              <label class="form-label">Posisi / Jabatan</label>
              <input class="form-input" v-model="form.position" placeholder="e.g. Software Engineer" />
            </div>
          </div>
          <div v-if="error" class="alert alert-warning" style="margin-top: 8px">{{ error }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')">Batal</button>
          <button class="btn btn-primary" @click="saveChanges" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { apiFetch } from '../../utils/api.js';
import { ref, onMounted } from 'vue'

const props = defineProps({
  employee: { type: Object, required: true }
})
const emit = defineEmits(['close', 'saved'])

const form = ref({
  employee_id: '',
  name: '',
  unit: '',
  position: ''
})
const saving = ref(false)
const error = ref('')

onMounted(() => {
  form.value = {
    employee_id: props.employee.id,
    name: props.employee.name,
    unit: props.employee.unit || '',
    position: props.employee.position || ''
  }
})

async function saveChanges() {
  if (!form.value.name.trim()) {
    error.value = 'Nama tidak boleh kosong'
    return
  }
  saving.value = true
  error.value = ''
  try {
    const res = await apiFetch(`/api/employees/${form.value.employee_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.value.name.trim(),
        unit: form.value.unit.trim() || null,
        position: form.value.position.trim() || null
      })
    })
    const json = await res.json()
    if (json.success) {
      emit('saved')
    } else {
      error.value = json.message || 'Gagal menyimpan'
    }
  } catch (e) {
    error.value = 'Gagal menyimpan: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-modal { max-width: 680px; }
.modal-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text);
}
.btn-close {
  display: flex; align-items: center; justify-content: center;
  width: 34px; height: 34px;
  border: none; background: none;
  color: var(--text-secondary); cursor: pointer;
  border-radius: var(--radius); transition: all 0.2s;
}
.btn-close:hover { background: var(--surface-variant); color: var(--text); }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field-hint { font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px; display: block; }
.spinner {
  width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }
</style>
