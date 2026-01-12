import db from '../config/database.js';

export const ActivityLogModel = {
  // Create activity log
  create: (logData) => {
    const stmt = db.prepare(`
      INSERT INTO activity_logs (user_id, action, details, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?)
    `);

    return stmt.run(
      logData.user_id || null,
      logData.action,
      logData.details || null,
      logData.ip_address || null,
      logData.user_agent || null
    );
  },

  // Get all logs with pagination
  findAll: (page = 1, limit = 20, filters = {}) => {
    let query = `
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (filters.user_id) {
      query += ' AND l.user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.action) {
      query += ' AND l.action LIKE ?';
      params.push(`%${filters.action}%`);
    }

    if (filters.date_from) {
      query += ' AND l.created_at >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND l.created_at <= ?';
      params.push(filters.date_to);
    }

    query += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    return db.prepare(query).all(...params);
  },

  // Count logs
  count: (filters = {}) => {
    let query = 'SELECT COUNT(*) as total FROM activity_logs WHERE 1=1';
    const params = [];

    if (filters.user_id) {
      query += ' AND user_id = ?';
      params.push(filters.user_id);
    }

    if (filters.action) {
      query += ' AND action LIKE ?';
      params.push(`%${filters.action}%`);
    }

    if (filters.date_from) {
      query += ' AND created_at >= ?';
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ' AND created_at <= ?';
      params.push(filters.date_to);
    }

    return db.prepare(query).get(...params).total;
  },

  // Delete old logs (for maintenance)
  deleteOlderThan: (days) => {
    return db.prepare(`
      DELETE FROM activity_logs
      WHERE created_at < datetime('now', '-' || ? || ' days')
    `).run(days);
  },
};
