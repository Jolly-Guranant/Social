// socketServer.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000", // Your frontend URL
        methods: ["GET", "POST"],
        credentials: true,
        transports: ['websocket', 'polling']
    }
});

// Store user socket mappings
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('New client connected to socket server');

    socket.on('join', (userId) => {
        userSockets.set(userId, socket.id);
        console.log(`User ${userId} connected with socket ${socket.id}`);
    });

    socket.on('sendMessage', async (messageData) => {
        try {
            const { from, to, text } = messageData;
            console.log('Received message:', messageData);
            
            // Get receiver's socket ID
            const receiverSocketId = userSockets.get(to);
            
            const messageToSend = {
                from,
                to,
                text,
                _id: new Date().getTime().toString(), // Temporary ID for real-time display
                createdAt: new Date()
            };
            
            if (receiverSocketId) {
                // Emit to receiver
                io.to(receiverSocketId).emit('message', messageToSend);
            }
            
            // Emit back to sender
            socket.emit('message', messageToSend);
            
        } catch (error) {
            console.error('Error handling message:', error);
            socket.emit('messageError', { error: 'Failed to send message' });
        }
    });

    socket.on('disconnect', () => {
        for (const [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                console.log(`User ${userId} disconnected from socket server`);
                break;
            }
        }
    });
});
const SOCKET_PORT = process.env.SOCKET_PORT || 3002;

server.listen(SOCKET_PORT, () => {
    console.log(`Socket.IO server running on port ${SOCKET_PORT}`);
});

export { io };  // Export for potential use in other parts of your application