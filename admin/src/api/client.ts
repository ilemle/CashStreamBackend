import axios from 'axios';

// В development используем прокси из vite.config.ts, в production - переменную окружения
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor для добавления токена (если потребуется в будущем)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor для обработки ошибок
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      // TODO: Добавить страницу логина когда она будет создана
      // window.location.href = '/login';
      console.warn('Unauthorized access. Please login.');
    }
    return Promise.reject(error);
  }
);

export default apiClient;

