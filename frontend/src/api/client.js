import axios from 'axios';

const api = axios.create({
  baseURL: 'https://stem-academia-backend.onrender.com',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sa_token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;