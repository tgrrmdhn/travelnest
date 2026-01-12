import jwt from 'jsonwebtoken';
import { ChatModel } from '../models/chat.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key';

export const setupSocketIO = (io) => {
  // Middleware untuk authentication
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, JWT_SECRET);
      socket.userId = decoded.userId; // Changed from decoded.id to decoded.userId
      socket.userRole = decoded.role;
      
      console.log(`✅ Socket authenticated: User ${decoded.userId} (${decoded.role})`);
      next();
    } catch (error) {
      console.error('❌ Socket authentication error:', error);
      next(new Error('Authentication error'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔌 User connected: ${socket.userId}`);
    
    // Join user's personal room
    socket.join(`user_${socket.userId}`);

    // Join conversation room
    socket.on('join_conversation', ({ otherUserId }) => {
      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.join(roomId);
      console.log(`📥 User ${socket.userId} joined conversation room: ${roomId}`);
      
      // Mark messages as read
      ChatModel.markAsRead(otherUserId, socket.userId);
      
      // Notify other user that messages were read
      io.to(`user_${otherUserId}`).emit('messages_read', {
        userId: socket.userId
      });
    });

    // Leave conversation room
    socket.on('leave_conversation', ({ otherUserId }) => {
      const roomId = [socket.userId, otherUserId].sort().join('_');
      socket.leave(roomId);
      console.log(`📤 User ${socket.userId} left conversation room: ${roomId}`);
    });

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { receiverId, message } = data;
        
        if (!receiverId || !message) {
          socket.emit('error', { message: 'Missing required fields' });
          return;
        }

        // Save message to database
        const result = ChatModel.create({
          sender_id: socket.userId,
          receiver_id: receiverId,
          message: message,
          is_read: 0
        });

        const messageData = {
          id: result.lastInsertRowid,
          sender_id: socket.userId,
          receiver_id: receiverId,
          message: message,
          is_read: 0,
          created_at: new Date().toLocaleString('sv-SE', { timeZone: 'Asia/Jakarta' }).replace(' ', 'T'),
        };

        // Send to conversation room (both users if they joined)
        const roomId = [socket.userId, receiverId].sort().join('_');
        console.log(`📤 Emitting to room ${roomId}:`, messageData);
        io.to(roomId).emit('new_message', messageData);

        // Send confirmation back to sender (important!)
        console.log(`📤 Emitting to sender ${socket.userId}:`, messageData);
        socket.emit('new_message', messageData);

        // Also send to receiver's personal room (in case they haven't joined conversation room yet)
        console.log(`📤 Emitting to receiver user_${receiverId}:`, messageData);
        io.to(`user_${receiverId}`).emit('new_message', messageData);

        // Send notification to receiver
        io.to(`user_${receiverId}`).emit('message_notification', {
          senderId: socket.userId,
          message: message,
          timestamp: messageData.created_at
        });

        console.log(`💬 Message sent from ${socket.userId} to ${receiverId}`);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing_start', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        typing: true
      });
    });

    socket.on('typing_stop', ({ receiverId }) => {
      io.to(`user_${receiverId}`).emit('user_typing', {
        userId: socket.userId,
        typing: false
      });
    });

    // Disconnect handler
    socket.on('disconnect', () => {
      console.log(`🔌 User disconnected: ${socket.userId}`);
    });

    // Error handler
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO handlers initialized');
};
