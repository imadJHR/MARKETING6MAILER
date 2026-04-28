import axios from "axios";

const API_BASE_URL = "https://wutcdbj6wt3yww43qio7wvfjea0ajodn.lambda-url.eu-north-1.on.aws/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout:12000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);