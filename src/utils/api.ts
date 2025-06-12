import axios from 'axios';

// Configuration des URLs de base pour chaque service
const SERVICE_URLS = {
  AUTH: 'http://localhost:8081/api',
  ACCOUNTS: 'http://localhost:8082/api',
  TRANSACTIONS: 'http://localhost:8083/api',
  NOTIFICATIONS: 'http://localhost:8084/api' // si vous avez un service séparé
};

// Création d'instances Axios pour chaque service
const authApi = axios.create({
  baseURL: SERVICE_URLS.AUTH,
  headers: { 'Content-Type': 'application/json' }
});

const accountsApi = axios.create({
  baseURL: SERVICE_URLS.ACCOUNTS,
  headers: { 'Content-Type': 'application/json' }
});

const transactionsApi = axios.create({
  baseURL: SERVICE_URLS.TRANSACTIONS,
  headers: { 'Content-Type': 'application/json' }
});

const notificationsApi = axios.create({
  baseURL: SERVICE_URLS.NOTIFICATIONS,
  headers: { 'Content-Type': 'application/json' }
});

// Intercepteur commun pour ajouter le token
const addAuthToken = (config: any) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Ajout des intercepteurs à chaque instance
[authApi, accountsApi, transactionsApi, notificationsApi].forEach(apiInstance => {
  // Intercepteur de requête
  apiInstance.interceptors.request.use(addAuthToken);
  
  // Intercepteur de réponse
  apiInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        localStorage.removeItem('accessToken');
        window.location.reload();
      }
      return Promise.reject(error);
    }
  );
});

// Export des API
export const authAPI = {
  login: (email: string, password: string) =>
    authApi.post('/auth/login', { email, password }),
  register: (name: string, email: string, password: string) =>
    authApi.post('/auth/register', { name, email, password }),
};

export const accountsAPI = {
  getAccounts: () => accountsApi.get('/accounts'),
  createAccount: (data: any) => accountsApi.post('/accounts', data),
  updateAccount: (id: string, data: any) => accountsApi.put(`/accounts/${id}`, data),
  closeAccount: (id: string) => accountsApi.delete(`/accounts/${id}`),
};

export const transactionsAPI = {
  getTransactions: () => transactionsApi.get('/transactions'),
  transfer: (sourceAccountId: string, destinationAccountId: string, amount: number) =>
    transactionsApi.post('/transactions', { sourceAccountId, destinationAccountId, amount }),
  deposit: (accountId: string, amount: number) =>
    transactionsApi.post('/transactions/depot', { accountId, amount }),
  withdraw: (accountId: string, amount: number) =>
    transactionsApi.post('/transactions/retrait', { accountId, amount }),
};

export const notificationsAPI = {
  getNotifications: () => notificationsApi.get('/notifications'),
};