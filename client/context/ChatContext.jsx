import {
    useState,
    useContext,
    useEffect,
    useCallback
} from "react";
import { AuthContext } from "../context/AuthContext";
import { ChatContext } from "../context/ChatContextValue";
import toast from "react-hot-toast";

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const { socket, axios } = useContext(AuthContext);

 /*Get Users*/
    const getUsers = useCallback(async () => {
        try {
            const { data } = await axios.get(
                "/api/messages/users"
            );
            console.log("GET USERS RESPONSE:", data);
            if (data.success) {
                setUsers(data.users || []);
                setUnseenMessages(
                    data.unseenMessages || {}
                );
            } else {
                toast.error(
                    data.message || "Failed to get users"
                );
            }
        } catch (error) {
            console.error(
                "GET USERS ERROR:",
                error
            );
            toast.error(
                error.response?.data?.message ||
                error.message
            );
        }
    }, [axios]);
   /*Get Message*/
    const getMessages = useCallback(async (userId) => {
        if (!userId) {
            console.log(
                "getMessages stopped: no userId"
            );
            return;
        }
        try {
            console.log(
                "Getting messages for:",
                userId
            );
            const { data } = await axios.get(
                `/api/messages/${userId}`
            );
            console.log(
                "GET MESSAGES RESPONSE:",
                data
            );
            if (data.success) {
                setMessages(
                    data.messages || []
                );
            } else {
                toast.error(
                    data.message || "Failed to get messages"
                );
            }
        } catch (error) {

            console.error(
                "GET MESSAGES ERROR:",
                error
            );
            toast.error(
                error.response?.data?.message ||
                error.message
            );
        }
    }, [axios]);

   /*send message*/
    const sendMessage = useCallback(async (messageData) => {
        if (!selectedUser?._id) {
            console.log(
                "Cannot send message: no selected user"
            );
            return;
        }
        try {
            console.log(
                "Sending message to:",
                selectedUser._id
            );
            console.log(
                "Message data:",
                messageData
            );
            const { data } = await axios.post(
                `/api/messages/send/${selectedUser._id}`,
                messageData
            );
            console.log(
                "SEND MESSAGE RESPONSE:",
                data
            );
            if (data.success) {
                setMessages((prevMessages) => [
                    ...prevMessages,
                    data.message
                ]);
            } else {
                toast.error(
                    data.message ||
                    "Message could not be sent"
                );
            }
        } catch (error) {

            console.error(
                "SEND MESSAGE ERROR:",
                error
            );
            toast.error(
                error.response?.data?.message ||
                error.message
            );
        }
    }, [axios, selectedUser]);
 /*Socket.io*/
    useEffect(() => {
        if (!socket) {
            console.log(
                "Socket not available"
            );
            return;
        }
        const handleNewMessage = async (newMessage) => {
            console.log(
                "NEW MESSAGE RECEIVED:",
                newMessage
            );
            if (
                selectedUser &&
                newMessage.senderId === selectedUser._id
            ) {
                newMessage.seen = true;
                setMessages((prevMessages) => [
                    ...prevMessages,
                    newMessage
                ]);
                try {
                    await axios.put(
                        `/api/messages/mark/${newMessage._id}`);
                } 
                catch (error) {
                    console.error( "Mark message error:",  error);
                }
            } 
            else {
                setUnseenMessages(
                    (prevUnseenMessages) => ({
                        ...prevUnseenMessages,

                        [newMessage.senderId]:
                            (prevUnseenMessages[
                                newMessage.senderId
                            ] || 0) + 1
                    })
                );
            }
        };
        socket.on(
            "newMessage",
            handleNewMessage
        );
        return () => {
            socket.off(
                "newMessage",
                handleNewMessage
            );
        };
    }, [socket, selectedUser, axios]);
/*Context Value*/
    const value = {
        messages,
        users,
        selectedUser,

        getUsers,
        getMessages,
        sendMessage,

        setMessages,
        setSelectedUser,

        unseenMessages,
        setUnseenMessages
    };
    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};