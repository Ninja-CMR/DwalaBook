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
    timeout: 10000, // 10s timeout to detect dead backends faster
});

console.log('[API DEBUG] BaseURL Configured:', api.defaults.baseURL);
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
                console.error(`Network Error: Impossible de joindre le backend à ${api.defaults.baseURL}. Vérifiez votre connexion ou si le serveur Render est actif.`);
            }
        } else if (error.response?.status === 404) {
            console.error(`404 Error: La route ${error.config.url} n'existe pas sur le serveur ${api.defaults.baseURL}`);
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
