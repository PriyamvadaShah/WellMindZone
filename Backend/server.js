import express from "express";
import { PORT, mongoDBUrl } from "./config.js";
import cors from "cors";
import mongoose from 'mongoose';
import patientRoutes from './api/routes/PatientRoute.js';
import doctorRoutes from "./api/routes/DoctorRoute.js";
import {Server} from "socket.io";
import http from 'http';

const app = express();
const server = http.createServer(app);

app.use(express.json());
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      callback(null, true);
    } else {
      callback(null, origin);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};

app.use(cors(corsOptions));

app.get('/', (req, res) => {
  return res.status(234).send('hello world');
});

app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

mongoose
  .connect(mongoDBUrl)
  .then(() => {
    console.log('App connected to database');
  })
  .catch((error) => {
    console.log(error);
  });

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();
const roomParticipants = new Map();
const activeConnections = new Set(); // Track active connections

const io = new Server(server, { 
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  pingTimeout: 60000, // Increase ping timeout
  pingInterval: 25000, // Increase ping interval
  transports: ['websocket', 'polling'], // Explicitly specify transports
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000
});

const getRoomParticipants = (room) => {
  if (!roomParticipants.has(room)) {
    roomParticipants.set(room, new Set());
  }
  return roomParticipants.get(room);
};

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  activeConnections.add(socket.id);
  
  // Send initial connection acknowledgment
  socket.emit("connection:established", { id: socket.id });

  // Add heartbeat mechanism
  const heartbeat = setInterval(() => {
    if (activeConnections.has(socket.id)) {
      socket.emit("ping");
    } else {
      clearInterval(heartbeat);
    }
  }, 25000);

  socket.on("pong", () => {
    // Client is still alive
    console.log(`Heartbeat received from ${socket.id}`);
  });

  const logRoomState = (room) => {
    const participants = getRoomParticipants(room);
    console.log(`Room ${room} participants:`, Array.from(participants));
    console.log(`Socket ${socket.id} rooms:`, socket.rooms);
    console.log(`Total active connections:`, activeConnections.size);
  };

  socket.on("room:join", (data) => {
    const { email, room } = data;
    
    if (!room) {
      return socket.emit("error", { message: "Room ID is required." });
    }

    try {
      // Handle existing connection
      const existingSocketId = emailToSocketIdMap.get(email);
      if (existingSocketId && existingSocketId !== socket.id) {
        const oldSocket = io.sockets.sockets.get(existingSocketId);
        if (oldSocket) {
          const oldRooms = Array.from(oldSocket.rooms);
          oldRooms.forEach(oldRoom => {
            if (oldRoom !== oldSocket.id) {
              const participants = getRoomParticipants(oldRoom);
              participants.delete(email);
            }
          });
          activeConnections.delete(existingSocketId);
          oldSocket.disconnect(true);
        }
        console.log(`Disconnected stale socket for ${email}`);
      }
      
      // Update maps
      emailToSocketIdMap.set(email, socket.id);
      socketidToEmailMap.set(socket.id, email);
      
      // Leave all other rooms first
      socket.rooms.forEach(roomId => {
        if (roomId !== socket.id) {
          socket.leave(roomId);
        }
      });

      // Join new room
      socket.join(room);
      const participants = getRoomParticipants(room);
      participants.add(email);
      
      console.log(`User joined room: ${room}, email: ${email}, socket ID: ${socket.id}`);
      logRoomState(room);
      
      // Emit events
      const participantsList = Array.from(participants);
      io.to(room).emit("room:participants", { 
        participants: participantsList,
        currentRoom: room 
      });
      
      io.to(room).emit("user:joined", { email, id: socket.id });
      console.log('Emitting room:join:success with:', { room, participantsList });

      socket.emit("room:join:success", { 
        room,
        participants: participantsList,
        socketId: socket.id 
      });

    } catch (error) {
      console.error("Error in room:join:", error);
      socket.emit("error", { message: "Failed to join room", error: error.message });
    }
  });

  socket.on("disconnect", (reason) => {
    const email = socketidToEmailMap.get(socket.id);
    console.log(`Disconnect reason:`, reason);
    
    if (email) {
      const userRooms = Array.from(socket.rooms);
      userRooms.forEach(room => {
        if (room !== socket.id) {
          const participants = getRoomParticipants(room);
          participants.delete(email);
          io.to(room).emit("user:left", { email });
          io.to(room).emit("room:participants", { 
            participants: Array.from(participants),
            currentRoom: room
          });
        }
      });
      
      emailToSocketIdMap.delete(email);
      socketidToEmailMap.delete(socket.id);
      console.log(`User ${email} disconnected, cleaned up all rooms.`);
    }

    activeConnections.delete(socket.id);
    clearInterval(heartbeat);
    console.log(`Socket Disconnected: ${socket.id}`);
  });

  // Existing call handling events remain the same
  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });

// In your server.js file - fix the stream:request handler
// In your server.js file
socket.on("stream:request", ({ to }) => {
  // Prevent self-requests which cause loops
  if (to === socket.id) return;
  
  console.log(`User ${socket.id} requesting stream from ${to}`);
  socket.to(to).emit("stream:request", { from: socket.id });
});
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;