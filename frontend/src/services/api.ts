import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auto inject JWT token from LocalStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('printing_auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auto handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear invalid token
      localStorage.removeItem('printing_auth_token');
      localStorage.removeItem('printing_auth_user');
      // Let the page reload or trigger state update
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const VIETCRAFT_API_URL = import.meta.env.VITE_VIETCRAFT_BE_URL || 'http://localhost:8080';

export function resolveArtworkUrl(url?: string): string {
  if (!url) return '/images/default-design.png';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  return `${VIETCRAFT_API_URL}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default api;
