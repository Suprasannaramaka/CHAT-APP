import { io } from "socket.io-client";
const SOCKET_URL = import.meta.env.VITE_API_URL || "https://quick-chat-xi-two.vercel.app";
let socket = null;

export const connectSocket = (userId) => {
    if (!socket && userId) {
        socket = io(SOCKET_URL, {
            query: { userId },
            transports: ["websocket"] // ⚠️ Essential for Vercel deployment
        });
    }
    return socket;
};

export const getSocket = () => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};