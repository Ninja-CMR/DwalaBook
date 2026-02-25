import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ref } from 'vue';

export const isConnectingError = ref(false);

const getBaseURL = () => {
    const rawUrl = import.meta.env.VITE_API_URL || '';
    if (!rawUrl) return '/api';

    // Ensure the URL ends with /api if it's a remote URL
    if (rawUrl.startsWith('http') && !rawUrl.endsWith('/api')) {
        return rawUrl.endsWith('/') ? `${rawUrl}api` : `${rawUrl}/api`;
    }
    return rawUrl;
};

const api = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('[API DEBUG] BaseURL:', api.defaults.baseURL);
console.log('[API DEBUG] Current Token:', localStorage.getItem('token') ? 'PRESENT' : 'NULL');

api.interceptors.response.use(
    response => {
        isConnectingError.value = false;
        return response;
    },
    error => {
        if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
            isConnectingError.value = true;
            if (window.location.hostname === 'localhost') {
                console.warn('Transient network error detected relative to localhost proxy.');
            } else {
                console.error('Network Error: Unable to reach the backend at', api.defaults.baseURL);
            }
        }
        return Promise.reject(error);
    }
);

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
