import db from '../config/database.js';

export const logActivity = (action) => {
  return (req, res, next) => {
    try {
      const userId = req.user?.id || null;
      const ipAddress = req.ip || req.connection.remoteAddress;

      const log = db.prepare(`
        INSERT INTO activity_logs (user_id, action, details, ip_address)
        VALUES (?, ?, ?, ?)
      `);

      const details = {
        method: req.method,
        path: req.path,
        body: req.body,
        query: req.query,
      };

      log.run(userId, action, JSON.stringify(details), ipAddress);
    } catch (error) {
      console.error('Logging error:', error);
    }

    next();
  };
};