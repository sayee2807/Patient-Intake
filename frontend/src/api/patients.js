import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8000/api' });

export const registerPatient = (data) => API.post('/patients', data);
export const getAllPatients = (params) => API.get('/patients', { params });
export const searchPatients = (q) => API.get('/patients/search', { params: { q } });
export const suggestPatient = (data) => API.post('/patients/suggest', data);
export const overrideTriage = (id, data) => API.patch(`/patients/${id}/override`, data);
export const getStats = () => API.get('/stats');
export const getTrends = (range) => API.get('/trends', { params: { range } });