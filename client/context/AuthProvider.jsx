import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import {toast} from "react-hot-toast";
import { AuthContext } from "../context/AuthContext";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
console.log("BACKEND URL:", backendUrl);
axios.defaults.baseURL = backendUrl;

 const AuthProvider = ({ children }) => { 
    const [token, setToken] = useState(() => localStorage.getItem("token") );
         const [authUser, setAuthUser] = useState(null); 
    
         const [onlineUsers, setOnlineUsers] = useState([]); 
         const [socket, setSocket] = useState(null); 
         const socketRef = useRef(null);
          // SOCKET CONNECTION
           const connectSocket = (userData) => 
            { if (!userData?._id) 
        { console.log("Socket not connected: user ID missing");
             return;
             } 
             if (!backendUrl)
     { console.error( "VITE_BACKEND_URL is missing from .env" );
         return; } 
         // Don't create another socket if one already exists
         if (socketRef.current) 
            { 
                console.log("Socket already exists");
                 return;
                 } 
        console.log( "Connecting Socket.IO for user:", userData._id ); 
        const newSocket = io(backendUrl, { query: { userId: userData._id, }, });
 newSocket.on("connect", () => 
    { 
        console.log( "Socket connected:", newSocket.id ); });
         newSocket.on("getOnlineUsers", (userIds) => 
            { 
                console.log( "Online users received:", userIds );
                 setOnlineUsers(userIds); });
         newSocket.on("connect_error", (error) => { 
            console.error( "Socket connection error:", error.message );
         });
          newSocket.on("disconnect", (reason) =>
             { console.log( "Socket disconnected:", reason );
                 setOnlineUsers([]); }); 
                 socketRef.current = newSocket; setSocket(newSocket); };
             // CHECK AUTHENTICATION 
             useEffect(() => { if (!token) return;
             const checkAuth = async () =>
                 { try
                     { 
        console.log("Checking authentication..."); 
        const { data } = await axios.get( "/api/auth/check", { headers: { token: token, }, } );
         console.log("Check auth response:", data); 
         if (data.success) { setAuthUser(data.user); 
            // Socket connection happens here 
            connectSocket(data.user); } 
            else { setAuthUser(null); 
                localStorage.removeItem("token"); 
                setToken(null); } } 
                catch (error) 
                { console.error( "CheckAuth error:", error ); 
        if (error.response) 
            { console.error( "Status:", error.response.status ); 
        console.error( "Response:", error.response.data ); 
    } 
    else if (error.request) 
        { console.error( "No response received from backend" );

         } 
         else { console.error( "Request error:", error.message ); 

         }
          setAuthUser(null); 
        } 
        }; 
        checkAuth();
     }, [token]); 
     // LOGIN 
      const login = async (state, credentials) => 
        { try
             { console.log("Login request starting..."); 
                const { data } = await axios.post( `/api/auth/${state}`, credentials ); 
                console.log("Login response:", data); 
        if (!data.success) { toast.error(data.message); return false; } 
    setAuthUser(data.userData); localStorage.setItem( "token", data.token ); 
    setToken(data.token); toast.success(data.message); 
    return true;
 } 
    catch (error) 
    { 
        console.error( "Login error:", error );
         toast.error( error.response?.data?.message || error.message || "Login failed" ); 
         return false;
         } 
        }; 
        // LOGOUT
         const logout = () => 
            { localStorage.removeItem("token");
                 setToken(null);
                  setAuthUser(null); 
                  setOnlineUsers([]);
         if (socketRef.current) 
        { socketRef.current.disconnect();
             socketRef.current = null; } 
             setSocket(null);
         delete axios.defaults.headers.common["token"]; 
         toast.success( "Logged out successfully" );
         }; 
         // UPDATE PROFILE 
        const updateProfile = async (body) =>
             { try 
                { 
    const { data } = await axios.put( "/api/auth/update-profile", body );
     if (data.success) 
        { setAuthUser(data.user); 
            toast.success( "Profile updated successfully" );
             return true; 
            }
             toast.error(data.message); 
             return false;
             } 
             catch (error) 
            { 
                console.error( "Update profile error:" , error ); 
        toast.error( error.response?.data?.message || error.message || "Profile update failed" ); 
        return false; 
    }
 }; // SET AXIOS TOKEN 
 useEffect(() => 
    { if 
        (token)
         { axios.defaults.headers.common["token"] = token;

          }
           else 
            { 
    delete axios.defaults.headers.common[ "token" ];
 } 
}, [token]); 
// CONTEXT VALUE
const value = { axios, authUser, onlineUsers, socket, login, logout, updateProfile, }; 
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
export default AuthProvider;