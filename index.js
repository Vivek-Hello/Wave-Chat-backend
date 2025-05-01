import express from 'express';
import dotenv from 'dotenv';
import { DB } from './src/utils/DB.js';
import authRout from './src/routes/Auth.Route.js';
import messageRoute from './src/routes/Message.Route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
}));

// Routes
app.use("/api/auth", authRout);
app.use("/api/message", messageRoute);
app.get("/", (req, res) => {
  res.send("Welcome to Home page");
});

// Server & Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
    transports: ['websocket', 'polling'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// In-Memory User Map
const users = new Map();

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("join", (userId) => {
    if (!userId) {
      return socket.emit("error", { message: "User ID required" });
    }

    const existingSocketId = users.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      io.sockets.sockets.get(existingSocketId)?.disconnect(true);
    }

    users.set(userId, socket.id);
    socket.userId = userId;
    socket.join(userId);
    console.log(`✅ User ${userId} joined via ${socket.id}`);
  });

  socket.on("send-message", ({ receiverId, message }) => {
    if (!receiverId || !message) return;
    io.to(receiverId).emit("message received", message);
  });

  socket.on("leave", (userId) => {
    if (userId && users.has(userId)) {
      users.delete(userId);
      socket.leave(userId);
      console.log(`👋 User ${userId} left manually`);
    }
  });

  socket.on("disconnect", () => {
    if (socket.userId) {
      users.delete(socket.userId);
      console.log(`❌ User ${socket.userId} disconnected`);
    }
  });
});

// Start server after DB connection
DB().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
}).catch((err) => {
  console.error("❌ DB Connection Error:", err);
});
