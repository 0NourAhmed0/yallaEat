import axios from "axios";
import { getToken } from "../auth/auth";

const api = axios.create({
  baseURL: "http://localhost:3000/api",
  // if your backend uses cookies instead of token, set true:
  withCredentials: false,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
