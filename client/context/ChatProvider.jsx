// src/context/ChatProvider.jsx
import { useState, useContext, useEffect, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import { ChatContext } from "./ChatContext";
import { api }  from  "../src/services/api.js";

 const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState();
    const [unseenMessages, setUnseenMessages] = useState({});
    
    const { socket, onlineUsers , authUser } = useContext(AuthContext);

    /* Manual Fetch Helper (if called by components later) */
    const getUsers = useCallback(async () => {
        try {
            const { data } = await api.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            console.error("GET USERS ERROR:", error);
        }
    }, []);

    /* Fetch Messages for Selected User */
    const getMessages = useCallback(async (userId) => {
        if (!userId) return;
        try {
            const { data } = await api.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error("GET MESSAGES ERROR:", error);
        }
    }, []);

    /* Send Message */
    const sendMessage = useCallback(async (messageData) => {
        if (!selectedUser?._id) return;
        try {
            const { data } = await api.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.message]);
            }
        } catch (error) {
            console.error("SEND MESSAGE ERROR:", error);
        }
    }, [selectedUser]);

    /* Initial Load: Fetch users directly inside useEffect (No cascading triggers) */
    useEffect(() => {
        let isMounted = true;

        const loadInitialUsers = async () => {
            try {
                const { data } = await api.get("/api/messages/users");
                if (isMounted && data.success) {
                    setUsers(data.users || []);
                    setUnseenMessages(data.unseenMessages || {});
                }
            } catch (error) {
                console.error("Initial load error:", error);
            }
        };

        loadInitialUsers();

        return () => {
            isMounted = false;
        };
    }, []); // 👈 Runs strictly once on mount with zero dependencies

    /* Socket.io Real-Time Listener */
    useEffect(() => {
        if  (!authUser) return;
        if (!socket) return;

        const handleNewMessage = async (newMessage) => {
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
export default  ChatProvider;