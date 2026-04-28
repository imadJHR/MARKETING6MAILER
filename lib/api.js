import axios from "axios";

// En production (Vercel), on utilise le proxy interne pour éviter CORS
// En développement local, on appelle directement le backend
const isProduction = process.env.NODE_ENV === 'production';
const API_BASE_URL = isProduction
  ? '/api/proxy'                         // ← proxy Next.js (app/api/proxy/[...path])
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,   // 60 secondes (pour les envois de campagne)
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur de réponse (gestion d'erreur)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);