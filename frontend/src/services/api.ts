import axios from 'axios';

// Safely normalize baseURL: removes trailing slashes and ensures /api/v1 suffix
const PROD_API_URL = 'https://nutrisync-e8ze.onrender.com/api/v1';
let rawURL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? PROD_API_URL : 'http://localhost:8000/api/v1')).trim();
rawURL = rawURL.replace(/\/+$/, '');
if (!rawURL.endsWith('/api/v1')) {
    rawURL = `${rawURL}/api/v1`;
}

const api = axios.create({
    baseURL: rawURL,
    timeout: 45000, // 45s to allow Render free tier instances to spin up on cold starts
    headers: {
        'Content-Type': 'application/json',
    },
});

// Automatically attach the JWT token to every request if it exists
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;