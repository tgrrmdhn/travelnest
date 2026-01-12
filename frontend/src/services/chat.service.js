import api from './api';

export const chatService = {
  // Get conversation with specific user
  getConversation: async (userId, limit = 50) => {
    return await api.get(`/chat/conversation/${userId}?limit=${limit}`);
  },

  // Get all conversations
  getConversations: async () => {
    return await api.get('/chat/conversations');
  },

  // Send message (REST API fallback)
  sendMessage: async (receiverId, message) => {
    return await api.post('/chat/send', {
      receiver_id: receiverId,
      message: message,
    });
  },

  // Mark messages as read
  markAsRead: async (userId) => {
    return await api.put(`/chat/read/${userId}`);
  },

  // Get unread count
  getUnreadCount: async () => {
    return await api.get('/chat/unread');
  },
};
