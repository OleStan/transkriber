import axios, { AxiosRequestConfig, AxiosError } from 'axios';

// Create an axios instance with default config
const api = axios.create({
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to include CSRF token
api.interceptors.request.use((config: AxiosRequestConfig) => {
  // Get CSRF token from cookie
  const token = getCsrfToken();
  if (token && config.headers) {
    config.headers['X-CSRF-Token'] = token;
  }
  return config;
}, (error: AxiosError) => {
  return Promise.reject(error);
});

// Function to extract CSRF token from cookies
const getCsrfToken = (): string | null => {
  return document.cookie
    .split('; ')
    .find(row => row.startsWith('CSRF-TOKEN='))
    ?.split('=')[1] || null;
};

export default api;
