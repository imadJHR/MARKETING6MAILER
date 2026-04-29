import axios from "axios";

const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? '/api/proxy'                              // ← proxy générique
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);