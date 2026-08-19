import express from "express";
import "dotenv/config";
import cors from "cors";

import { connectDB } from "./lib/db.js";
import router from "./routes/routes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
//create Express App and HTTP server
const app = express();
const httpServer = http.createServer(app);

//Initalize socket.io server
export const io = new Server(httpServer , {
    cors:{origin: "*"},
    methods: ["GET" , "POST" , "PUT" , "DELETE"]
});
//Store online users
export const userSocketMap = {}; //{userId : socketId}
//socket.io connection handler
io.on("connection" , (socket) =>
{
    const userId = socket.handshake.query.userId;
    console.log("User Connected" , userId);
    
    if(userId) {
        userSocketMap[userId] = socket.id;
    }
    console.log("Current online Users:" , Object.keys(userSocketMap));
    //Emit online users to all connected clients
    io.emit("getOnlineUsers" , Object.keys(userSocketMap));

    socket.on("disconnect", () => {
        console.log("User Disconnected", userId);
        if (userId)
            {
                delete userSocketMap[userId];
            }
        io.emit( "getOnlineUsers", Object.keys(userSocketMap));
    });
}) 
//Middleware setup
app.use(express.json({limit: "4mb"}));
app.use(cors({
     origin:  [
 "http://localhost:5173" ,
  "https://chat-app-phi-sooty-8oh3joks6t.vercel.app"
     ],

   credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization" , "token"]
}));
//Routes setup
app.get("/api/status", (req , res) => res.send("Server is live"));
app.get("/api/test-auth", (req, res) => {
    res.json({
        message: "Auth routing works"
    });
});
app.post("/api/test-login", (req, res) => {
    console.log("🔥 TEST LOGIN ROUTE REACHED");

    res.json({
        success: true,
        message: "Test route works"
    });
});
app.use("/api/auth" , router);
app.use("/api/messages" , messageRouter);
//Connect to MongoDB
await connectDB();

//Export server for vercel

export default app;