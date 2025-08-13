 import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

import webhookRoutes from './routes/webhook.js';
import messageRoutes from './routes/messages.js';
import conversationRoutes from './routes/conversations.js';
import Message from './models/Message.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// ✅ Allow both localhost & Vercel frontend URLs
const FRONTEND_URLS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://whatsapp-clone-delta-lemon.vercel.app' // replace with your actual deployed frontend
];

const io = new Server(server, {
  cors: {
    origin: FRONTEND_URLS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
});

app.use(cors({
  origin: FRONTEND_URLS,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(__dirname, '../dist/index.html'));
    }
  });
}

// MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/whatsapp', {
    dbName: 'whatsapp',
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Socket.IO
io.on('connection', (socket) => {
  console.log('🟢 User connected:', socket.id);

  socket.on('join-conversation', (waId) => {
    socket.join(waId);
    console.log(`👥 ${socket.id} joined conversation ${waId}`);
  });

  socket.on('leave-conversation', (waId) => {
    socket.leave(waId);
    console.log(`🚪 ${socket.id} left conversation ${waId}`);
  });

  socket.on('send-message', async (messageData) => {
    try {
      const savedMessage = await Message.create(messageData);
      io.to(messageData.waId).emit('new-message', savedMessage);
    } catch (err) {
      console.error('❌ Error saving message:', err);
    }
  });

  socket.on('disconnect', () => {
    console.log('🔴 User disconnected:', socket.id);
  });
});

app.set('io', io);

// Routes
app.use('/api/webhook', webhookRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/conversations', conversationRoutes);

// Health
app.get('/', (req, res) => res.send('Backend is running ✅'));
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }));

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
