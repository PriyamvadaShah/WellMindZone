import express from "express";
import { PORT, mongoDBUrl } from "./config.js";
import cors from "cors";
import mongoose from 'mongoose';
import patientRoutes from './api/routes/PatientRoute.js';
import doctorRoutes from "./api/routes/DoctorRoute.js";
import { Server } from "socket.io";
import http from 'http';

const app = express();
const server = http.createServer(app);

app.use(express.json());

const corsOptions = {
  origin: "*", // Or restrict it to your frontend
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
};
app.use(cors(corsOptions));

app.get('/', (req, res) => res.status(234).send('hello world'));
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

mongoose.connect(mongoDBUrl)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((error) => console.error('❌ MongoDB Error:', error));

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🔌 New socket connected: ${socket.id}`);

  socket.on("room:join", ({ email, room }) => {
    socket.join(room);
    const otherUsers = [...(io.sockets.adapter.rooms.get(room) || [])].filter(id => id !== socket.id);

    // Notify joining user about others
    socket.emit("room:users", { users: otherUsers });

    // Notify others that a user joined
    socket.to(room).emit("user:joined", { email, id: socket.id });

    // Acknowledge join
    socket.emit("room:join", { email, room });
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("user:ready", ({ to, from }) => {
    console.log("🔁 user:ready from", from, "to", to);
    io.to(to).emit("user:ready", { from });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

export default app;
