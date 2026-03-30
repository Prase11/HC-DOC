import { defineStore } from 'pinia';
import { apiFetch } from '../utils/api.js';

const getUserFromStorage = () => {
    try {
        const item = localStorage.getItem('user');
        return item ? JSON.parse(item) : null;
    } catch (e) {
        localStorage.removeItem('user');
        return null;
    }
};

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: getUserFromStorage(),
        token: localStorage.getItem('token') || null,
        loading: false,
        error: null
    }),

    getters: {
        isAuthenticated: (state) => !!state.token,
        isSuperAdmin: (state) => state.user?.role === 'superadmin',
        isHrStaff: (state) => ['superadmin', 'hrstaff'].includes(state.user?.role),
    },

    actions: {
        async login(email, password) {
            this.loading = true;
            this.error = null;

            try {
                const res = await apiFetch('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({ email, password })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.message || data.error || 'Login failed');
                }

                // Save to state & localstorage
                this.token = data.data.token;
                this.user = data.data.user;

                localStorage.setItem('token', this.token);
                localStorage.setItem('user', JSON.stringify(this.user));

                return true;
            } catch (err) {
                this.error = err.message || 'Network error';
                return false;
            } finally {
                this.loading = false;
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        },

        async checkAuth() {
            if (!this.token) return;

            try {
                const res = await apiFetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    this.user = data.data;
                    localStorage.setItem('user', JSON.stringify(this.user));
                } else {
                    this.logout();
                }
            } catch (error) {
                console.error('Failed to restore session', error);
                this.logout();
            }
        }
    }
});
