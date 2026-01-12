import { ActivityLogModel } from '../models/activityLog.model.js';

/**
 * Middleware to log all API activities for admin monitoring
 */
export const logActivity = (req, res, next) => {
  // Skip logging for health checks and static files
  if (req.path === '/health' || req.path.startsWith('/uploads/')) {
    return next();
  }

  // Store original end function
  const originalEnd = res.end;

  // Override end function to log after response
  res.end = function(...args) {
    // Call original end
    originalEnd.apply(res, args);

    // Log activity asynchronously
    try {
      const action = `${req.method} ${req.path}`;
      const details = JSON.stringify({
        method: req.method,
        path: req.path,
        status: res.statusCode,
        query: req.query,
        params: req.params,
      });

      ActivityLogModel.create({
        user_id: req.user?.id || null,
        action,
        details,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('user-agent'),
      });
    } catch (error) {
      // Don't throw errors from logging
      console.error('[Activity Log Error]', error);
    }
  };

  next();
};
