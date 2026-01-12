import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('✅ Socket.IO connected');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket.IO disconnected:', reason);
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join conversation room
  joinConversation(otherUserId) {
    if (this.socket) {
      this.socket.emit('join_conversation', { otherUserId });
    }
  }

  // Leave conversation room
  leaveConversation(otherUserId) {
    if (this.socket) {
      this.socket.emit('leave_conversation', { otherUserId });
    }
  }

  // Send message
  sendMessage(receiverId, message) {
    return new Promise((resolve, reject) => {
      if (!this.socket) {
        reject(new Error('Socket not connected'));
        return;
      }

      this.socket.emit('send_message', { receiverId, message });
      
      // Listen for confirmation or error
      const timeout = setTimeout(() => {
        reject(new Error('Message send timeout'));
      }, 5000);

      this.socket.once('new_message', (data) => {
        clearTimeout(timeout);
        resolve(data);
      });

      this.socket.once('error', (error) => {
        clearTimeout(timeout);
        reject(error);
      });
    });
  }

  // Listen for new messages
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
      this.listeners.set('new_message', callback);
    }
  }

  // Listen for message notifications
  onMessageNotification(callback) {
    if (this.socket) {
      this.socket.on('message_notification', callback);
      this.listeners.set('message_notification', callback);
    }
  }

  // Listen for typing indicator
  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
      this.listeners.set('user_typing', callback);
    }
  }

  // Send typing indicator
  startTyping(receiverId) {
    if (this.socket) {
      this.socket.emit('typing_start', { receiverId });
    }
  }

  stopTyping(receiverId) {
    if (this.socket) {
      this.socket.emit('typing_stop', { receiverId });
    }
  }

  // Listen for messages read
  onMessagesRead(callback) {
    if (this.socket) {
      this.socket.on('messages_read', callback);
      this.listeners.set('messages_read', callback);
    }
  }

  // Remove specific listener
  off(event) {
    if (this.socket && this.listeners.has(event)) {
      this.socket.off(event, this.listeners.get(event));
      this.listeners.delete(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    this.listeners.forEach((_, event) => {
      if (this.socket) {
        this.socket.off(event);
      }
    });
    this.listeners.clear();
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export default new SocketService();
