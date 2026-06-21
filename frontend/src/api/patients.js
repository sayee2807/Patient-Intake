import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

// Attach token to every request automatically
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If token expires, redirect to login
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const suggestPatient = (data) => API.post('/patients/suggest', data);
export const registerPatient = (data) => API.post('/patients', data);
export const getAllPatients = (params) => API.get('/patients', { params });
export const searchPatients = (q) => API.get('/patients/search', { params: { q } });
export const overrideTriage = (id, data) => API.patch(`/patients/${id}/override`, data);
export const getStats = () => API.get('/stats');
export const getTrends = (range) => API.get('/trends', { params: { range } });