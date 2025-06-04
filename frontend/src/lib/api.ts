// lib/api.ts
import axios from 'axios';
import Cookies from 'js-cookie';

const api = axios.create({
  baseURL: 'https://sustracker-backend-v2-0-1.onrender.com'
});

api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;