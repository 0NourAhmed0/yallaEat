import axios from "axios";
import { getToken } from "../auth/auth";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`,
  // if your backend uses cookies instead of token, set true:
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
