import axios, { type InternalAxiosRequestConfig } from 'axios';
import { ref } from 'vue';

export const isConnectingError = ref(false);

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/',
    headers: {
        'Content-Type': 'application/json',
    },
});

console.log('[API DEBUG] BaseURL:', api.defaults.baseURL);
console.log('[API DEBUG] Current Token:', localStorage.getItem('token'));

api.interceptors.response.use(
    response => {
        isConnectingError.value = false;
        return response;
    },
    error => {
        if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
            isConnectingError.value = true;
            console.warn('Transient network error detected relative to localhost proxy.');
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
