import { defineStore } from 'pinia';
import api from '../api';
import router from '../router';
import type { User } from '../types';

export const useAuthStore = defineStore('auth', {
    state: () => {
        const storedUser = localStorage.getItem('user');
        return {
            token: localStorage.getItem('token') || null as string | null,
            user: storedUser ? JSON.parse(storedUser) as User : null,
            isAuthenticated: !!localStorage.getItem('token'),
        };
    },
    getters: {
        isFree: (state) => state.user?.plan === 'free',
        isStarter: (state) => state.user?.plan === 'starter',
        isPro: (state) => state.user?.plan === 'pro',
    },
    actions: {
        async login(credentials: any) {
            try {
                const response = await api.post('/auth/login', credentials);
                this.token = response.data.token;
                this.user = response.data.user;
                this.isAuthenticated = true;

                if (this.token) {
                    localStorage.setItem('token', this.token);
                }
                if (this.user) {
                    localStorage.setItem('user', JSON.stringify(this.user));
                }

                // Use replace to avoid "back button" leading to login page
                await router.replace('/dashboard');
            } catch (error) {
                console.error('Login failed', error);
                throw error;
            }
        },
        async register(userData: any) {
            try {
                const response = await api.post('/auth/register', userData);
                console.log('Registration success', response.data);

                // Directly set state from registration result instead of a second login call
                this.token = response.data.token;
                this.user = response.data.user;
                this.isAuthenticated = true;

                if (this.token) localStorage.setItem('token', this.token);
                if (this.user) localStorage.setItem('user', JSON.stringify(this.user));

                await router.replace('/dashboard');
            } catch (error) {
                console.error('Registration failed', error);
                throw error;
            }
        },
        async upgradePlan(plan: 'starter' | 'pro') {
            if (!this.user) return;
            try {
                const response = await api.post('/auth/upgrade', { plan });
                this.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                console.error('Upgrade failed', error);
                throw error;
            }
        },
        async fetchUser() {
            try {
                const response = await api.get('/auth/me');
                this.user = response.data.user;
                localStorage.setItem('user', JSON.stringify(this.user));
            } catch (error) {
                console.error('Fetch user failed', error);
            }
        },
        logout() {
            this.token = null;
            this.user = null;
            this.isAuthenticated = false;
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            router.push('/login');
        },
    },
});
