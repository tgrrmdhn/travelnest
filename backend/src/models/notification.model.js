import db from '../config/database.js';

export const NotificationModel = {
  // Create notification
  create: (notificationData) => {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type, is_read)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      notificationData.user_id,
      notificationData.title,
      notificationData.message,
      notificationData.type,
      notificationData.is_read || 0
    );
  },

  // Get notifications for user
  findByUserId: (userId, limit = 20) => {
    return db.prepare(`
      SELECT * FROM notifications
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);
  },

  // Mark notification as read
  markAsRead: (id) => {
    return db.prepare(`
      UPDATE notifications SET is_read = 1 WHERE id = ?
    `).run(id);
  },

  // Mark all as read for user
  markAllAsRead: (userId) => {
    return db.prepare(`
      UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0
    `).run(userId);
  },

  // Get unread count
  getUnreadCount: (userId) => {
    return db.prepare(`
      SELECT COUNT(*) as total FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).get(userId).total;
  },

  // Delete notification
  delete: (id) => {
    return db.prepare('DELETE FROM notifications WHERE id = ?').run(id);
  },
};