import axios from "axios";

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const api = axios.create({
  baseURL: isLocal ? 'http://localhost:4000/api' : 'https://music-store-showcase-backend.vercel.app/api',
  timeout: 10000,
});

export default api;
