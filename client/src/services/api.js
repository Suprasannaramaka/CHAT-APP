import axios from "axios";
const API_URL = import.meta.env.VITE_API_URL || "https://quick-chat-xi-two.vercel.app";

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Needed if you are using cookies/sessions
});

// Optional: Pre-written functions for your routes
export const checkServerStatus = () => api.get("/api/status");
export const loginUser = (credentials) => api.post("/api/auth/login", credentials);
export const getMessages = (chatId) => api.get(`/api/messages/${chatId}`);