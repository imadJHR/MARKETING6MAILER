import axios from "axios";

// Appel direct vers votre backend Lambda (pas de proxy)
const API_BASE_URL = "https://wutcdbj6wt3yww43qio7wvfjea0ajodn.lambda-url.eu-north-1.on.aws/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 60 secondes pour l’envoi des campagnes
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);