<template>
  <div class="login-page-wrapper">
    <!-- Outer Background Shapes -->
    <div class="outer-bg shape-top-left"></div>
    <div class="outer-bg shape-bottom-right"></div>
    <div class="outer-bg shape-dots"></div>

    <!-- Main Split Container -->
    <div class="main-container">
      
      <!-- Left Panel: Graphic -->
      <div class="left-panel">
        <!-- Logo -->
        <div class="logo-area">
          <svg class="logo-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          <span class="logo-text">HC Doc</span>
        </div>

        <!-- Center Illustration -->
        <div class="illustration-area">
          <img src="/login-illustration-v2.png" alt="Login Graphic" class="hero-image" />
        </div>

        <!-- Footer -->
        <div class="footer-area">
          Copyright © 2026, PT Garuda Maintenance Facility Aero Asia Tbk.<br/>All rights reserved.
        </div>
      </div>

      <!-- Right Panel: Form -->
      <div class="right-panel">
        
        <!-- The floating form card -->
        <div class="form-card">
          <!-- Form Header -->
          <div class="form-header">
            <h2 class="form-title">Sign In</h2>
            <p class="form-subtitle">Welcome to HC Doc</p>
          </div>

          <transition name="fade">
            <div v-if="authStore.error" class="error-alert">
              {{ authStore.error }}
            </div>
          </transition>

          <form @submit.prevent="handleLogin" class="form-body">
            
            <div class="input-container">
              <label>Email Address</label>
              <input type="text" v-model="form.email" placeholder="Enter your Account" required>
            </div>

            <div class="input-container">
              <label>Password</label>
              <input :type="showPassword ? 'text' : 'password'" v-model="form.password" placeholder="••••••••" required>
              <button type="button" class="eye-btn" @click="showPassword = !showPassword">
                 <svg v-if="showPassword" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                 <svg v-else viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
              </button>
            </div>

            <div class="form-options">
              <label class="checkbox">
                <input type="checkbox" v-model="form.remember">
                <span class="box-indicator"></span>
                Remember me
              </label>
            </div>

            <button type="submit" class="submit-btn" :disabled="authStore.loading || !form.email || !form.password">
              <span v-if="!authStore.loading">Sign In</span>
              <div v-else class="loader"></div>
            </button>
            
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const router = useRouter();
const authStore = useAuthStore();

const form = ref({
    email: '',
    password: '',
    remember: false
});

const showPassword = ref(false);

const handleLogin = async () => {
    const success = await authStore.login(form.value.email, form.value.password);
    if (success) {
        router.push('/dashboard');
    }
};
</script>

<style scoped>
/* Base Typography and Variables */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

.login-page-wrapper {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8fafc; /* light background */
  font-family: 'Plus Jakarta Sans', sans-serif;
  position: relative;
  overflow: hidden;
}

/* Abstract Background Shapes matching the visual theme */
.outer-bg {
  position: absolute;
  z-index: 0;
}

.shape-top-left {
  top: -10vw;
  left: -10vw;
  width: 60vw;
  height: 60vw;
  background: #003d5e;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.8;
}

.shape-bottom-right {
  bottom: -20vw;
  right: -10vw;
  width: 80vw;
  height: 80vw;
  background: linear-gradient(135deg, #006297 0%, #ffffff 100%);
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.6;
}

.shape-dots {
  top: 50px;
  right: 50px;
  width: 200px;
  height: 200px;
  background-image: radial-gradient(rgba(255,255,255,0.4) 2px, transparent 2px);
  background-size: 20px 20px;
  opacity: 0.5;
}

/* Main Split Container */
.main-container {
  z-index: 10;
  width: 88%;
  max-width: 960px;
  height: 560px;
  background: #f4f6fb; /* very light blue/gray */
  border-radius: 28px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  overflow: hidden;
  position: relative;
  animation: scaleUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes scaleUp {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

/* === LEFT PANEL === */
.left-panel {
  width: 50%;
  background: linear-gradient(135deg, #006297, #004a73);
  border-radius: 0 32px 32px 0;
  position: relative;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: white;
  overflow: hidden;
}

/* Decoration lines inside left panel */
.left-panel::after {
  content: '';
  position: absolute;
  top: -50px;
  right: -50px;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
}

.logo-area {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 1.1rem;
  z-index: 2;
}

.logo-svg {
  width: 24px;
  height: 24px;
  color: #fff;
}

.illustration-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.hero-image {
  width: 100%;
  max-width: 340px;
  height: auto;
  z-index: 2;
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-15px); }
  100% { transform: translateY(0px); }
}

.footer-area {
  font-size: 0.72rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.4;
  z-index: 2;
}

/* === RIGHT PANEL === */
.right-panel {
  width: 50%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}

.form-card {
  width: 100%;
  max-width: 330px;
  background: white;
  border-radius: 22px;
  padding: 28px 26px;
  box-shadow: 0 15px 35px rgba(0,0,0,0.05);
  z-index: 2;
  position: relative;
  top: -10px;
}

/* Form Header */
.form-header {
  margin-bottom: 18px;
  text-align: center;
}

.form-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 5px 0;
}

.form-subtitle {
  font-size: 0.9rem;
  color: #64748b;
  margin: 0;
}

/* Inputs */
.input-container {
  margin-bottom: 14px;
  position: relative;
}

.input-container label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  color: #64748b;
  margin-bottom: 5px;
}

.input-container input {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.88rem;
  font-family: inherit;
  color: #1e293b;
  background: #f8fafc;
  transition: all 0.3s;
  outline: none;
  box-sizing: border-box;
}

.input-container input:focus {
  border-color: #006297;
  background: #fff;
  box-shadow: 0 0 0 4px rgba(0, 98, 151, 0.1);
}

.eye-btn {
  position: absolute;
  right: 14px;
  bottom: 14px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0;
  display: flex;
  transition: color 0.3s;
}

.eye-btn:hover {
  color: #006297;
}

/* Form Options (Remember & Forgot) */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  font-size: 0.8rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-weight: 500;
  cursor: pointer;
}

.checkbox input {
  display: none;
}

.box-indicator {
  width: 16px;
  height: 16px;
  border: 2px solid #cbd5e1;
  border-radius: 4px;
  position: relative;
  transition: all 0.2s;
}

.checkbox input:checked + .box-indicator {
  background: #006297;
  border-color: #006297;
}

.checkbox input:checked + .box-indicator::after {
  content: '';
  position: absolute;
  left: 4px;
  top: 1px;
  width: 3px;
  height: 7px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

/* Submit Button */
.submit-btn {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  background: #006297;
  color: white;
  font-size: 0.92rem;
  font-weight: 700;
  font-family: inherit;
  border: none;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 8px 15px rgba(0, 98, 151, 0.25);
  display: flex;
  justify-content: center;
  align-items: center;
  height: 44px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 20px rgba(0, 98, 151, 0.35);
  background: #005280;
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Error Alert */
.error-alert {
  background: #fee2e2;
  color: #ef4444;
  padding: 10px;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  text-align: center;
  margin-bottom: 20px;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive adjustments */
@media (max-width: 900px) {
  .main-container {
    flex-direction: column;
    height: auto;
    min-height: auto;
    width: 95%;
    border-radius: 20px;
  }
  
  .left-panel, .right-panel {
    width: 100%;
  }

  .left-panel {
    border-radius: 20px 20px 0 0;
    min-height: 200px;
    padding: 30px;
  }
  
  .hero-image {
    max-width: 200px;
    margin: 20px 0;
  }
  
  .right-panel {
    padding: 30px 20px 30px;
    min-height: auto;
  }

  .form-card {
    top: 0;
    margin: 0 auto;
  }

}

@media (max-width: 480px) {
  .main-container {
    width: 100%;
    border-radius: 0;
    box-shadow: none;
  }

  .left-panel {
    border-radius: 0;
    min-height: 160px;
    padding: 24px 20px;
  }

  .form-card {
    padding: 24px 20px;
    border-radius: 20px;
  }

  .form-title {
    font-size: 1.3rem;
  }

  .footer-area {
    font-size: 0.7rem;
    text-align: center;
  }

  .login-page-wrapper {
    align-items: flex-start;
  }
}
</style>
