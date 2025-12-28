import db from '../config/database.js';

export const ChatModel = {
  // Create message
  create: (messageData) => {
    const stmt = db.prepare(`
      INSERT INTO chats (sender_id, receiver_id, message, is_read)
      VALUES (?, ?, ?, ?)
    `);

    return stmt.run(
      messageData.sender_id,
      messageData.receiver_id,
      messageData.message,
      messageData.is_read || 0
    );
  },

  // Get conversation between two users
  getConversation: (userId1, userId2, limit = 50) => {
    return db.prepare(`
      SELECT c.*,
        sender.name as sender_name, sender.avatar as sender_avatar,
        receiver.name as receiver_name, receiver.avatar as receiver_avatar
      FROM chats c
      JOIN users sender ON c.sender_id = sender.id
      JOIN users receiver ON c.receiver_id = receiver.id
      WHERE (c.sender_id = ? AND c.receiver_id = ?)
         OR (c.sender_id = ? AND c.receiver_id = ?)
      ORDER BY c.created_at DESC
      LIMIT ?
    `).all(userId1, userId2, userId2, userId1, limit);
  },

  // Get all conversations for user
  getConversations: (userId) => {
    return db.prepare(`
      SELECT DISTINCT
        CASE 
          WHEN c.sender_id = ? THEN c.receiver_id
          ELSE c.sender_id
        END as other_user_id,
        u.name as other_user_name,
        u.avatar as other_user_avatar,
        (SELECT message FROM chats 
         WHERE (sender_id = ? AND receiver_id = other_user_id)
            OR (sender_id = other_user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message,
        (SELECT created_at FROM chats 
         WHERE (sender_id = ? AND receiver_id = other_user_id)
            OR (sender_id = other_user_id AND receiver_id = ?)
         ORDER BY created_at DESC LIMIT 1) as last_message_time,
        (SELECT COUNT(*) FROM chats 
         WHERE sender_id = other_user_id AND receiver_id = ? AND is_read = 0) as unread_count
      FROM chats c
      JOIN users u ON (CASE 
        WHEN c.sender_id = ? THEN c.receiver_id
        ELSE c.sender_id
      END) = u.id
      WHERE c.sender_id = ? OR c.receiver_id = ?
      ORDER BY last_message_time DESC
    `).all(userId, userId, userId, userId, userId, userId, userId, userId, userId);
  },

  // Mark messages as read
  markAsRead: (senderId, receiverId) => {
    return db.prepare(`
      UPDATE chats SET is_read = 1
      WHERE sender_id = ? AND receiver_id = ? AND is_read = 0
    `).run(senderId, receiverId);
  },

  // Get unread count
  getUnreadCount: (userId) => {
    return db.prepare(`
      SELECT COUNT(*) as total FROM chats
      WHERE receiver_id = ? AND is_read = 0
    `).get(userId).total;
  },

  // Delete message
  delete: (id) => {
    return db.prepare('DELETE FROM chats WHERE id = ?').run(id);
  },
};
