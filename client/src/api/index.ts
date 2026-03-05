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
    timeout: 60000, // 60s timeout to allow Render free tier to spin up (cold start)
});

console.log('[API DEBUG] BaseURL Configured:', api.defaults.baseURL);
const token = localStorage.getItem('token');
if (token) {
    console.log('[API DEBUG] Auth Token: PRESENT');
} else {
    console.log('[API DEBUG] Auth Token: NOT_FOUND (Normal for Registration/Login)');
}

// Global Response Interceptor
api.interceptors.response.use(
    response => {
        isConnectingError.value = false;
        return response;
    },
    async error => {
        const config = error.config;
        const fullUrl = config?.url ? (config.baseURL || '') + config.url : 'unknown URL';

        // Advanced Retry Logic for Network Errors (Render spin-up handling)
        const isNetworkError = error.code === 'ERR_NETWORK' ||
            error.message?.includes('ECONNREFUSED') ||
            error.message?.includes('Network Error') ||
            error.message?.includes('NETWORK_CHANGED');

        if (isNetworkError && config) {
            // Track retries in the config object
            config._retryCount = config._retryCount || 0;
            const maxRetries = 3;

            if (config._retryCount < maxRetries) {
                config._retryCount++;

                // Exponential backoff: 2s, 4s, 8s
                const delay = Math.pow(2, config._retryCount) * 1000;

                console.warn(`[API] Erreur réseau sur ${fullUrl}. Tentative ${config._retryCount}/${maxRetries} dans ${delay / 1000}s...`);

                await new Promise(resolve => setTimeout(resolve, delay));
                return api(config);
            }
        }

        if (isNetworkError) {
            isConnectingError.value = true;
            if (window.location.hostname === 'localhost') {
                console.warn(`Transient network error detected relative to localhost proxy for ${fullUrl}.`);
            } else {
                console.error(`Network Error: Impossible de joindre le backend à ${fullUrl} après plusieurs tentatives. Vérifiez votre connexion ou si le serveur Render est actif.`);
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
