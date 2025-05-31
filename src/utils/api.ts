
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080'; // Update this to your backend URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post('/auth/register', { name, email, password }),
};

export const accountsAPI = {
  getAccounts: () => api.get('/api/comptes'),
  createAccount: (data: any) => api.post('/api/comptes', data),
  updateAccount: (id: string, data: any) => api.put(`/api/comptes/${id}`, data),
  closeAccount: (id: string) => api.delete(`/api/comptes/${id}`),
};

export const transactionsAPI = {
  getTransactions: () => api.get('/api/transactions'),
  transfer: (sourceAccountId: string, destinationAccountId: string, amount: number) =>
    api.post('/api/transactions/virement', { sourceAccountId, destinationAccountId, amount }),
  deposit: (accountId: string, amount: number) =>
    api.post('/api/transactions/depot', { accountId, amount }),
  withdraw: (accountId: string, amount: number) =>
    api.post('/api/transactions/retrait', { accountId, amount }),
};

export const notificationsAPI = {
  getNotifications: () => api.get('/api/notifications'),
};
