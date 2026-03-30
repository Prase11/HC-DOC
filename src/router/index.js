import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '../layouts/MainLayout.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
    {
        path: '/login',
        name: 'Login',
        component: () => import('../pages/LoginPage.vue'),
        meta: { title: 'Sign In', guestOnly: true }
    },
    {
        path: '/',
        component: MainLayout,
        redirect: '/dashboard',
        children: [
            {
                path: 'dashboard',
                name: 'Dashboard',
                component: () => import('../pages/DashboardPage.vue'),
                meta: { title: 'Dashboard', icon: 'dashboard', requiresAuth: true }
            },
            {
                path: 'e-dossier',
                name: 'EmployeeDossier',
                component: () => import('../pages/EmployeeDossierPage.vue'),
                meta: { title: 'Employee E-Dossier', icon: 'folder', requiresAuth: true }
            },
            {
                path: 'e-dossier/:employeeId',
                name: 'EmployeeDossierDetail',
                component: () => import('../pages/EmployeeDossierDetailPage.vue'),
                meta: { title: 'Employee Detail', icon: 'folder', requiresAuth: true },
                props: true
            },
            {
                path: 'reporting',
                name: 'Reporting',
                component: () => import('../pages/ReportingPage.vue'),
                meta: { title: 'Reporting', icon: 'chart', requiresAuth: true }
            },
            {
                path: 'admin',
                name: 'Admin',
                component: () => import('../pages/AdminPage.vue'),
                meta: { title: 'Admin', icon: 'settings', requiresAuth: true, requiresSuperAdmin: true }
            }
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior() {
        return { top: 0 }
    }
})

router.beforeEach(async (to, from, next) => {
    document.title = `${to.meta.title || 'Page'} — HR E-Dossier`

    // Lazy instance to avoid pinia context errors before app mount
    const authStore = useAuthStore()

    // Check local token validity with server
    if (authStore.token && !authStore.user) {
        await authStore.checkAuth()
    }

    const isAuthenticated = authStore.isAuthenticated

    // Redirect logic
    if (to.meta.requiresAuth && !isAuthenticated) {
        next('/login')
    } else if (to.meta.guestOnly && isAuthenticated) {
        next('/dashboard')
    } else if (to.meta.requiresSuperAdmin && !authStore.isSuperAdmin) {
        next('/dashboard')
    } else {
        next()
    }
})

export default router
