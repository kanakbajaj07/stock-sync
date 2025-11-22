import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't show toast for 401 errors on /auth/me (background check)
    const isAuthCheck = error.config?.url?.includes('/auth/me');
    
    if (error.response?.status === 401 && !isAuthCheck) {
      // Optional: Automatically logout on 401
      useAuthStore.getState().logout();
    }

    // Don't show toast for 404s (sometimes valid, e.g., search)
    if (error.response?.status !== 404 && !isAuthCheck) {
      const message = error.response?.data?.message || error.message || 'An error occurred';
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
