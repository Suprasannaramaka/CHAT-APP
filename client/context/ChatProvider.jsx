// src/context/ChatProvider.jsx
import { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";
import { api } from "../services/api"; // 👈 Direct import prevents cascading renders
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    
    // Grab socket and onlineUsers from AuthContext
    const { socket, onlineUsers } = useContext(AuthContext);

    /* Get Users & Unseen Messages */
    const getUsers = useCallback(async () => {
        try {
            const { data } = await api.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessages || {});
            } else {
                toast.error(data.message || "Failed to get users");
            }
        } catch (error) {
            console.error("GET USERS ERROR:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    }, []); // 👈 Stable dependency array

    /* Fetch Messages for Selected User */
    const getMessages = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { data } = await api.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages || []);
            } else {
                toast.error(data.message || "Failed to get messages");
            }
        } catch (error) {
            console.error("GET MESSAGES ERROR:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    }, []); // 👈 Stable dependency array

    /* Send Message */
    const sendMessage = useCallback(async (messageData) => {
        if (!selectedUser?._id) {
            toast.error("No selected user to send message to");
            return;
        }
        try {
            const { data } = await api.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            } else {
                toast.error(data.message || "Message could not be sent");
            }
        } catch (error) {
            console.error("SEND MESSAGE ERROR:", error);
            toast.error(error.response?.data?.message || error.message);
        }
    }, [selectedUser]);

    /* Fetch users on initial load */
    useEffect(() => {
        getUsers();
    }, [getUsers]);

    /* Socket.io Real-Time Listener */
    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
            console.log("NEW MESSAGE RECEIVED:", newMessage);
            
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                try {
                    await api.put(`/api/messages/mark/${newMessage._id}`);
                } catch (error) {
                    console.error("Mark message error:", error);
                }
            } else {
                setUnseenMessages((prevUnseenMessages) => ({
                    ...prevUnseenMessages,
                    [newMessage.senderId]: (prevUnseenMessages[newMessage.senderId] || 0) + 1
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser]);

    const value = {
        messages,
        users,
        selectedUser,
        onlineUsers,
        unseenMessages,
        getUsers,
        getMessages,
        sendMessage,
        setMessages,
        setSelectedUser,
        setUnseenMessages
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};