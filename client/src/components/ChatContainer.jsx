import assets  from "../assets/chat-app-assets/assets.js";
import { useContext,useEffect,useRef,useState} from "react";
import { formatMessageTime } from "../lib/utilits.js";
import { AuthContext } from "../../context/AuthContext.jsx";
import toast from "react-hot-toast";
import { ChatContext } from "../../context/ChatContextValue.jsx";

const ChatContainer = () => {
    const { messages,selectedUser,setSelectedUser,sendMessage, getMessages,} = useContext(ChatContext);
    const { authUser, onlineUsers } = useContext(AuthContext);
    const scrollEnd = useRef(null);
    const [input, setInput] = useState("");

    console.log("selectedUser:" , selectedUser);
     console.log("messages:" , messages);
      console.log("authUser:" , authUser);
       console.log("onlineUsers:" , onlineUsers);

    // Handle sending a text message
    const handleSendMessage = async (e) => {
        e.preventDefault();
        const text = input.trim();
 if (!text) {
            return;
        }
 await sendMessage({
            text
        });
        setInput("");
    };
    // Handle sending an image
    const handleSendImage = async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            return;
        }
        if (!file.type.startsWith("image/")) {
            toast.error("Please select an image file");
            e.target.value = "";
            return;
        }
        const reader = new FileReader();
        reader.onloadend = async () => {
            try {
                await sendMessage({
                    image: reader.result,
                });
            } catch (error) {
                console.error("Image send error:", error);
                toast.error("Failed to send image");
            }

            e.target.value = "";
        };
        reader.readAsDataURL(file);
    };
    // Get messages whenever the selected user changes
    useEffect(() => {
        if (!selectedUser) {
            return;
        }
         getMessages(selectedUser._id)
    }, [selectedUser, getMessages]);
    // Scroll to the latest message
    useEffect(() => {
        if (scrollEnd.current && messages) {
            scrollEnd.current.scrollIntoView({behavior: "smooth",});
        }
    }, [messages]);
    // If no user is selected, show the default screen
    if (!selectedUser) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 max-md:hidden">
                <p className="text-lg font-medium text-black">
                    Chat anytime, anywhere
                </p>
            </div>
        );
    }
    return (
        <div className="h-full overflow-scroll relative backdrop-blur-lg">
            {/* Header */}
            <div className="flex items-center gap-3 py-3 mx-4 border-b border-blue-200">
                <img
                    src= {selectedUser.profilePic || assets.avatar_icon}
                    alt="User avatar" className="w-8  rounded-full"/>
                <p className="flex-1 text-lg text-black flex items-center gap-2">
                  {selectedUser.fullName}
                    {onlineUsers.includes(selectedUser._id) && (
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    )}
                </p>
                {/* Close chat on mobile */}
                <img
                    onClick={() => setSelectedUser(null)} src={assets.arrow_icon}
                    alt="Back" className="md:hidden max-w-7 cursor-pointer"/>
                <img
                    src={assets.help_icon} alt="Help" className="max-md:hidden max-w-5"/>
            </div>
            {/* Chat area */}
            <div className="flex flex-col h-[calc(100%-120px)] bg-mauve-100 overflow-y-auto p-3 pb-6">
                {messages.map((msg, index) => {
                    const isMyMessage =
                        msg.senderId === authUser?._id;
                    return (
                        <div
                            key={msg._id || index}
                            className={`flex items-end gap-2 justify-end ${
                                !isMyMessage
                                    ? "flex-row-reverse"
                                    : ""
                            }`}>
                            {/* Message */}
                            {msg.image ? (
                                <img
                                    src={msg.image}
                                    alt="Sent image"
                                    className="max-w-62.5 border text-black border-b-taupe-600 rounded-lg overflow-hidden mb-8"
                                />
                            ) : (
                                <p
                                    className={`p-2 max-w-62.5 md:text-sm font-light rounded-lg mb-8 wrap-break-words bg-violet-500 text-black ${
                                        isMyMessage
                                            ? "rounded-br-none"
                                            : "rounded-bl-none"
                                    }`}>
                                    {msg.text}
                                </p>
                            )}
                            {/* Message user + time */}
                            <div className="text-center text-xs">
                                <img
                                    src={
                                        isMyMessage?  authUser?.profilePic ||
                                              assets.avatar_icon
                                            : selectedUser?.profilePic ||
                                              assets.avatar_icon
                                    }
                                    alt="Profile"
                                    className="w-7 h-7 rounded-full"
                                />
                                <p className="text-gray-500">
                                    {formatMessageTime(
                                        msg.createdAt
                                    )}
                                </p>

                            </div>

                        </div>
                    );
                })}
                {/* Scroll target */}
                <div ref={scrollEnd}></div>
            </div>
            {/* Bottom message area */}
            <div className="absolute bottom-0 left-0 right-0 flex items-center gap-3 p-3">
                <div className="flex-1 flex items-center bg-gray-100/20 px-3 rounded-full">
                    {/* Text input */}
                    <input
                        onChange={(e) =>
                            setInput(e.target.value)
                        }
                        value={input}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                handleSendMessage(e);
                            }
                        }}
                        type="text"
                        placeholder="Send a message"
                        className="flex-1 text-sm p-3 border-none rounded-lg outline-none text-black  bg-olive-300"
                    />
                    {/* Image input */}
                    <input
                        onChange= { handleSendImage }
                        type="file"
                        id="image"
                        accept="image/jpeg,image/png,image/jpg"
                        hidden
                    />
                    <label htmlFor="image">
                        <img
                            src={assets.gallery_icon}
                            alt="Upload"
                            className="w-5 mr-2 cursor-pointer"
                        />
                    </label>
                </div>
                {/* Send button */}
                <button
                    type="button"
                    onClick={ handleSendMessage }
                    className="cursor-pointer"
                >
                        <img
                        src={assets.send_button}
                        alt="Send"
                        className="w-5 mr-2"
                    />
                </button>
            </div>
        </div>
    );
};
export default ChatContainer;