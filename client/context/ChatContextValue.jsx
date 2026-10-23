// src/context/ChatContextValue.jsx
import { useState, useEffect, useContext } from "react";
import { api } from "../services/api"; // Your Axios instance
import { connectSocket, disconnectSocket, getSocket } from "../services/socket";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import {ChatContext} from "./ChatContext";

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);

    // Grab authUser from AuthContext to initialize the socket
    const { authUser } = useContext(AuthContext);

    // 1. Manage Socket Connection and Global Listeners
    useEffect(() => {
        if (!authUser) {
            disconnectSocket();
            return;
        }

        // Connect socket using the logged-in user's ID
        const socket = connectSocket(authUser._id);

        // Listen for online users update
        socket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });

        return () => {
            socket.off("getOnlineUsers");
            disconnectSocket();
        };
    }, [authUser]);

    // 2. Listen for Real-Time Incoming Messages
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        socket.on("newMessage", (newMessage) => {
            // Optional check: only append if the message belongs to the currently active chat
            // or handle notifications if it's from another user
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        });

        return () => {
            socket.off("newMessage");
        };
    }, [selectedUser]);

    // 3. Fetch messages for the selected chat
    const getMessages = async (userId) => {
        try {
            const res = await api.get(`/api/messages/${userId}`);
            setMessages(res.data);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages");
        }
    };

    // 4. Send a message (Text or Image)
    const sendMessage = async (messageData) => {
        try {
            if (!selectedUser) return;
            const res = await api.post(`/api/messages/send/${selectedUser._id}`, messageData);
            
            // Append message locally immediately after successful backend response
            setMessages((prevMessages) => [...prevMessages, res.data]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message");
        }
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                users,
                selectedUser,
                setSelectedUser,
                onlineUsers,
                getMessages,
                sendMessage
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};
