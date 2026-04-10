import axios from 'axios';

function normalizeApiBaseUrl(value) {
  const fallback = 'http://localhost:8080/api';
  const raw = (value || fallback).trim().replace(/\/+$/, '');
  return raw.endsWith('/api') ? raw : `${raw}/api`;
}

const api = axios.create({
  baseURL: normalizeApiBaseUrl(import.meta.env.VITE_API_URL),
  timeout: 15000,
});

export default api;
