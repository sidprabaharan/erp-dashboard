import axios from 'axios';

// Create axios instance with baseURL
const api = axios.create({
  baseURL: '/api'
});

// Add request interceptor to attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor to handle common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    // Handle 403 Forbidden
    if (error.response && error.response.status === 403) {
      console.error('Access forbidden:', error.response.data);
    }
    
    return Promise.reject(error);
  }
);

export default api;
