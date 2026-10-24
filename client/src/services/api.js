import axios from "axios";
const backendURL = import.meta.env.VITE_BACKEND_URL;

export const api = axios.create({
    baseURL: backendURL,
    withCredentials: true, // Needed if you are using cookies/sessions
});
// 🛡️ CRITICAL FIX: Request Interceptor to attach the token automatically
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            // Attach token in formats your backend likely expects
            config.headers.token = token;             // Common for MERN chat apps
            config.headers.Authorization = `Bearer ${token}`; // Standard Bearer format
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// Your route helper functions
export const checkServerStatus = () => api.get("/api/status");
export const loginUser = (credentials) => api.post("/api/auth/login", credentials);
export const getMessages = (chatId) => api.get(`/api/messages/${chatId}`);