const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { Server } = require('socket.io');
const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const { verifySocketToken } = require('./middleware/authMiddleware');
const { connectDB } = require('./config/db');

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_ORIGIN || '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'CoVideo Live Backend is running' });
});

io.use(async (socket, next) => {
  try {
    await verifySocketToken(socket);
    next();
  } catch (error) {
    next(new Error('Unauthorized'));
  }
});

const roomMembers = new Map();

const addSocketToRoom = (roomId, socketId) => {
  const members = roomMembers.get(roomId) || new Set();
  members.add(socketId);
  roomMembers.set(roomId, members);
};

const removeSocketFromRoom = (roomId, socketId) => {
  const members = roomMembers.get(roomId);
  if (!members) return;
  members.delete(socketId);
  if (members.size === 0) {
    roomMembers.delete(roomId);
  } else {
    roomMembers.set(roomId, members);
  }
};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id} user=${socket.userId}`);

  socket.on('join-room', ({ roomId }) => {
    if (!roomId) {
      return socket.emit('room-error', 'Missing roomId');
    }

    socket.join(roomId);
    addSocketToRoom(roomId, socket.id);

    const peers = [...(roomMembers.get(roomId) || [])].filter((id) => id !== socket.id);
    socket.emit('room-joined', { roomId, peers });
    socket.to(roomId).emit('peer-joined', { socketId: socket.id, userId: socket.userId });
  });

  socket.on('offer', ({ target, sdp }) => {
    if (!target || !sdp) {
      return socket.emit('signal-error', 'Offer payload must include target and sdp');
    }
    io.to(target).emit('offer', { sender: socket.id, userId: socket.userId, sdp });
  });

  socket.on('answer', ({ target, sdp }) => {
    if (!target || !sdp) {
      return socket.emit('signal-error', 'Answer payload must include target and sdp');
    }
    io.to(target).emit('answer', { sender: socket.id, userId: socket.userId, sdp });
  });

  socket.on('ice-candidate', ({ target, candidate }) => {
    if (!target || !candidate) {
      return socket.emit('signal-error', 'ICE candidate payload must include target and candidate');
    }
    io.to(target).emit('ice-candidate', { sender: socket.id, userId: socket.userId, candidate });
  });

  socket.on('leave-room', ({ roomId }) => {
    if (!roomId) return;
    socket.leave(roomId);
    removeSocketFromRoom(roomId, socket.id);
    socket.to(roomId).emit('peer-left', { socketId: socket.id, userId: socket.userId });
  });

  socket.on('disconnect', () => {
    socket.rooms.forEach((roomId) => {
      if (roomId === socket.id) return;
      removeSocketFromRoom(roomId, socket.id);
      socket.to(roomId).emit('peer-left', { socketId: socket.id, userId: socket.userId });
    });
    console.log(`Socket disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
