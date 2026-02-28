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
    timeout: 30000, // 30s timeout to allow Render free tier to spin up
});

console.log('[API DEBUG] BaseURL Configured:', api.defaults.baseURL);
const token = localStorage.getItem('token');
if (token) {
    console.log('[API DEBUG] Auth Token: PRESENT');
} else {
    console.log('[API DEBUG] Auth Token: NOT_FOUND (Normal for Registration/Login)');
}

api.interceptors.response.use(
    response => {
        isConnectingError.value = false;
        return response;
    },
    error => {
        const fullUrl = error.config?.url ? (error.config.baseURL || '') + error.config.url : 'unknown URL';

        if (error.code === 'ERR_NETWORK' || error.message.includes('ECONNREFUSED')) {
            isConnectingError.value = true;
            if (window.location.hostname === 'localhost') {
                console.warn(`Transient network error detected relative to localhost proxy for ${fullUrl}.`);
            } else {
                console.error(`Network Error: Impossible de joindre le backend à ${fullUrl}. Vérifiez votre connexion ou si le serveur Render est actif.`);
            }
        } else if (error.response?.status === 404) {
            console.error(`404 Error: La route demandée n'existe pas : ${fullUrl}`);
            console.error('Détails du serveur:', error.response.data);
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
