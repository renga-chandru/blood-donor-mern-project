import axios from 'axios';

let baseURL = import.meta.env.VITE_API_URL || '/api';
if (baseURL && !baseURL.endsWith('/api') && baseURL !== '/api') {
  // Automatically fix the URL if it doesn't end with /api
  baseURL = `${baseURL.replace(/\/$/, '')}/api`; 
}

const api = axios.create({
  baseURL: baseURL,
});

api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
