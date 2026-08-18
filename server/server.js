import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import userRouter from "./routes/routes.js";
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
    origin: (origin, callback) => {
        const allowedOrigins = [
            "http://localhost:5173",
            "https://chat-pheam9l9u-ramakasuprasannas-projects.vercel.app"
        ];

        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

//Routes setup
app.get("/api/status", (req , res) => res.send("Server is live"));
app.use("/api/auth" , userRouter);
app.use("/api/messages" , messageRouter)
//Connect to MongoDB
await connectDB();

if(process.env.NODE_ENV !== "Production")
{
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT , () => console.log("Server is running on PORT : " + PORT));
}

//Export server for vercel

export default app;