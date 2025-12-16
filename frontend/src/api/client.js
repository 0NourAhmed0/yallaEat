import axios from "axios";

// Default to same-origin so Vite can proxy `/api/*` to the backend in dev.
// For deployments, set `VITE_API_BASE_URL` to your backend origin (e.g. https://api.example.com).
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});


