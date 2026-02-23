import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: () => import('../views/LoginView.vue'),
            meta: { guest: true },
        },
        {
            path: '/register',
            name: 'register',
            component: () => import('../views/RegisterView.vue'),
            meta: { guest: true },
        },
        {
            path: '/forgot-password',
            name: 'forgot-password',
            component: () => import('../views/ForgotPasswordView.vue'),
            meta: { guest: true },
        },
        {
            path: '/reset-password',
            name: 'reset-password',
            component: () => import('../views/ResetPasswordView.vue'),
            meta: { guest: true },
        },
        {
            path: '/',
            name: 'home',
            component: () => import('../views/HomeView.vue'),
        },
        {
            path: '/dashboard',
            name: 'dashboard',
            component: () => import('../views/DashboardView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/appointments',
            name: 'appointments',
            component: () => import('../views/AppointmentsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/pricing',
            name: 'pricing',
            component: () => import('../views/PricingView.vue'),
        },
        {
            path: '/payment-result',
            name: 'payment-result',
            component: () => import('../views/PaymentStatusView.vue'),
        },
        {
            path: '/calendar',
            name: 'calendar',
            component: () => import('../views/CalendarView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/clients',
            name: 'clients',
            component: () => import('../views/ClientsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/settings',
            name: 'settings',
            component: () => import('../views/SettingsView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/staff',
            name: 'staff',
            component: () => import('../views/StaffView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/inventory',
            name: 'inventory',
            component: () => import('../views/InventoryView.vue'),
            meta: { requiresAuth: true },
        },
        {
            path: '/admin',
            name: 'admin',
            component: () => import('../views/AdminView.vue'),
            // For now, any auth user can access (in real app, check role)
            meta: { requiresAuth: true },
        },
        {
            path: '/b/:slug',
            name: 'public-booking',
            component: () => import('../views/PublicBookingView.vue'),
        },
        {
            path: '/legal',
            name: 'legal',
            component: () => import('../views/LegalView.vue'),
        },
        {
            path: '/privacy',
            name: 'privacy',
            component: () => import('../views/LegalView.vue'),
        },
        {
            path: '/terms',
            name: 'terms',
            component: () => import('../views/LegalView.vue'),
        },
    ],
});

router.beforeEach((to, _from, next) => {
    const authStore = useAuthStore();

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next('/login');
    } else if (to.meta.guest && authStore.isAuthenticated) {
        next('/dashboard');
    } else {
        next();
    }
});

export default router;
