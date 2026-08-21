import axios from 'axios';

const api = axios.create({
  baseURL: '',
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

export default api;
