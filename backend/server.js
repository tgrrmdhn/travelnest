import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Import configurations
import { initDatabase } from './src/config/database.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import rateLimiter from './src/middleware/rateLimiter.middleware.js';

// Import routes
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import hostRoutes from './src/routes/host.routes.js';
import travelerRoutes from './src/routes/traveler.routes.js';
import adminRoutes from './src/routes/admin.routes.js';
import chatRoutes from './src/routes/chat.routes.js';
import reviewRoutes from './src/routes/review.routes.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();
const httpServer = createServer(app);

// Log ALL requests at the earliest possible point
app.use((req, res, next) => {
  console.log(`🔴 EARLY LOG: ${req.method} ${req.path}`);
  next();
});

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: function(origin, callback) {
    try {
      // Allow requests from the same origin or from localhost
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:5173',
        process.env.CORS_ORIGIN
      ].filter(Boolean);
      
      console.log(`🔍 CORS Check: origin=${origin}, allowed=${allowedOrigins.join(',')}`);
      
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    } catch (err) {
      console.error('🔴 CORS Error:', err);
      callback(err);
    }
  },
  credentials: true,
}));
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Request logging for debugging (after JSON parsing)
app.use((req, res, next) => {
  const method = req.method;
  const originalUrl = req.originalUrl;
  const path = req.path;
  console.log(`📤 ${method.toUpperCase()} ${path} (full: ${originalUrl})`);
  
  next();
});

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Rate limiting
app.use('/api/', rateLimiter);

// Health check
app.get('/health', (req, res) => {
  console.log('✅ Health check requested');
  try {
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (e) {
    console.error('❌ Health check error:', e);
  }
});

// Test API endpoint
app.get('/api/test', (req, res) => {
  console.log('✅ Test endpoint requested');
  try {
    res.json({ 
      success: true,
      message: 'API is working!',
      timestamp: new Date().toISOString(),
    });
  } catch (e) {
    console.error('❌ Test endpoint error:', e);
  }
});

// API Routes (must come before static frontend files)
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/host', hostRoutes);
app.use('/api/traveler', travelerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/review', reviewRoutes);

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join_room', (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room ${roomId}`);
  });

  socket.on('send_message', (data) => {
    io.to(data.roomId).emit('receive_message', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Serve static frontend files
app.use(express.static(join(__dirname, '../frontend/dist')));

// 404 handler - serve index.html for SPA routing (only for non-API routes)
app.use((req, res) => {
  // Don't serve index.html for API routes (check originalUrl in case it's a mounted router)
  const url = req.originalUrl || req.url;
  if (url.startsWith('/api/')) {
    return res.status(404).json({ 
      success: false, 
      message: 'API route not found' 
    });
  }
  
  // For other routes, serve index.html for SPA routing
  res.sendFile(join(__dirname, '../frontend/dist/index.html'), { maxAge: '1d' });
});

// Error handler (must be last)
app.use(errorHandler);

// Initialize database and start server
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

try {
  // Initialize database
  initDatabase();
  console.log('✅ Database initialized successfully');

  // Start server
  httpServer.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 Socket.IO ready for real-time connections`);
  });
} catch (error) {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server gracefully...');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Catch all uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('🔴 UNCAUGHT EXCEPTION:', err);
  console.error('Stack:', err.stack);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 UNHANDLED REJECTION at:', promise, 'reason:', reason);
});
