 ];[[[[[[[[[[[[[[3hwgfhvbb ]]]]]]]]]]]]]]<template>
  <teleport to="body">
    <div class="modal-overlay" @click.self="$emit('close')">
      <div class="modal-content edit-admin-modal">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Admin
          </h3>
          <button class="btn-close" @click="$emit('close')">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Name <span class="required">*</span></label>
            <input
              class="form-input"
              :class="{ 'input-error': errors.name }"
              v-model="form.name"
              placeholder="Full name"
              @input="clearError('name')"
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">Email <span class="required">*</span></label>
            <input
              class="form-input"
              :class="{ 'input-error': errors.email }"
              type="email"
              v-model="form.email"
              placeholder="admin@company.com"
              @input="clearError('email')"
            />
            <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">New Password</label>
            <div class="password-wrap">
              <input
                class="form-input"
                :class="{ 'input-error': errors.password }"
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="Leave blank to keep current password"
                @input="clearError('password')"
              />
              <button type="button" class="password-toggle" @click="showPassword = !showPassword">
                <svg v-if="!showPassword" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
              </button>
            </div>
            <span class="field-hint">Only fill this if you want to change the password (min 8 characters)</span>
            <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Role <span class="required">*</span></label>
              <select
                class="form-input form-select"
                v-model="form.role"
                @change="clearError('role')"
              >
                <option value="superadmin">Super Admin</option>
                <option value="hrstaff">Admin</option>
              </select>
              <span v-if="errors.role" class="error-text">{{ errors.role }}</span>
            </div>
            <div class="form-group">
              <label class="form-label">Status</label>
              <select
                class="form-input form-select"
                v-model="form.status"
              >
                <option value="active">Active</option>
                <option value="disabled">Inactive</option>
              </select>
            </div>
          </div>
          <div v-if="serverError" class="alert alert-error">{{ serverError }}</div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="$emit('close')" :disabled="saving">Cancel</button>
          <button class="btn btn-primary" @click="handleSave" :disabled="saving">
            <span v-if="saving" class="spinner"></span>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { apiFetch } from '../../utils/api.js'

const ROLE_MAP = { 'Super Admin': 'superadmin', 'Admin': 'hrstaff' }

const props = defineProps({
  admin: { type: Object, required: true }
})
const emit = defineEmits(['close', 'saved'])

const form = ref({ name: '', email: '', password: '', role: '', status: 'active' })
const errors = ref({})
const serverError = ref('')
const saving = ref(false)
const showPassword = ref(false)

onMounted(() => {
  form.value = {
    name: props.admin.name,
    email: props.admin.email,
    password: '',
    role: ROLE_MAP[props.admin.role] || props.admin.role,
    status: props.admin.status === 'active' ? 'active' : 'disabled'
  }
})

function clearError(field) {
  if (errors.value[field]) delete errors.value[field]
  serverError.value = ''
}

function validate() {
  const errs = {}
  if (!form.value.name.trim()) errs.name = 'Name is required'
  if (!form.value.email.trim()) {
    errs.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    errs.email = 'Please enter a valid email address'
  }
  if (form.value.password && form.value.password.length < 8) {
    errs.password = 'Password must be at least 8 characters'
  }
  if (!form.value.role) errs.role = 'Please select a role'
  errors.value = errs
  return Object.keys(errs).length === 0
}

async function handleSave() {
  if (!validate()) return
  saving.value = true
  serverError.value = ''
  try {
    const body = {
      name: form.value.name.trim(),
      email: form.value.email.trim().toLowerCase(),
      role: form.value.role,
      status: form.value.status
    }
    if (form.value.password) body.password = form.value.password

    const res = await apiFetch(`/api/admins/${props.admin.id}`, {
      method: 'PUT',
      body: JSON.stringify(body)
    })
    const json = await res.json()
    if (json.success) {
      emit('saved')
    } else {
      serverError.value = json.message || 'Failed to update admin'
    }
  } catch (e) {
    serverError.value = 'Network error: ' + e.message
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.edit-admin-modal { max-width: 560px; }
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
.required { color: #ef4444; }
.input-error { border-color: #ef4444 !important; }
.error-text { color: #ef4444; font-size: 0.75rem; margin-top: 4px; display: block; }
.field-hint { font-size: 0.72rem; color: var(--text-secondary); margin-top: 4px; display: block; }
.alert-error {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 10px 14px;
  border-radius: var(--radius);
  font-size: 0.85rem;
  margin-top: 8px;
}
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
.password-wrap {
  position: relative;
  display: flex;
  align-items: center;
}
.password-wrap .form-input { padding-right: 40px; width: 100%; }
.password-toggle {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  border-radius: var(--radius);
  transition: all 0.2s;
}
.password-toggle:hover { color: var(--text); background: var(--surface-variant); }
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
