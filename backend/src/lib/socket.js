import { Server } from "socket.io";
import http from "http";
import express from "express";
import { ENV } from "./env.js";
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ENV.CLIENT_URL],
    credentials: true,
  },
});

// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware);

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {}; // {userId:socketId}

io.on("connection", (socket) => {
  console.log("A user connected", socket.user.fullName);

  const userId = socket.userId;
  userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  // ===== WebRTC Call Signaling =====

  // Caller sends offer to a specific user
  socket.on("call:offer", ({ to, offer, callerInfo }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:offer", {
        from: userId,
        offer,
        callerInfo,
      });
    }
  });

  // Receiver accepts and sends back answer
  socket.on("call:answer", ({ to, answer }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:answer", {
        from: userId,
        answer,
      });
    }
  });

  // Exchange ICE candidates
  socket.on("call:ice-candidate", ({ to, candidate }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:ice-candidate", {
        from: userId,
        candidate,
      });
    }
  });

  // End the call
  socket.on("call:end", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:end", { from: userId });
    }
  });

  // Reject incoming call
  socket.on("call:reject", ({ to }) => {
    const receiverSocketId = userSocketMap[to];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("call:reject", { from: userId });
    }
  });

  // ===== End WebRTC =====

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.user.fullName);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
