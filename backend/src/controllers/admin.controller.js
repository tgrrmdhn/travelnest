import { UserModel } from '../models/user.model.js';
import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';
import { ReviewModel } from '../models/review.model.js';
import db from '../config/database.js';

export const getStatistics = async (req, res, next) => {
  try {
    const totalUsers = UserModel.count();
    const totalHosts = UserModel.count({ role: 'host' });
    const totalTravelers = UserModel.count({ role: 'traveler' });
    const totalRequests = RequestModel.count();
    const pendingKyc = UserModel.count({ kyc_status: 'pending' });

    res.json({
      success: true,
      data: {
        totalUsers,
        totalHosts,
        totalTravelers,
        totalRequests,
        pendingKyc,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filters = {
      role: req.query.role,
      account_status: req.query.account_status,
      search: req.query.search,
    };

    const users = UserModel.findAll(page, limit, filters);
    const total = UserModel.count(filters);

    // Remove passwords
    users.forEach((user) => delete user.password);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const banUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot ban admin users',
      });
    }

    UserModel.updateAccountStatus(userId, 'banned');

    res.json({
      success: true,
      message: 'User banned successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const unbanUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    UserModel.updateAccountStatus(userId, 'active');

    res.json({
      success: true,
      message: 'User unbanned successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getKycRequests = async (req, res, next) => {
  try {
    const users = db.prepare(`
      SELECT id, email, name, kyc_status, kyc_document, created_at
      FROM users
      WHERE kyc_status = 'pending' AND kyc_document IS NOT NULL
      ORDER BY created_at DESC
    `).all();

    res.json({
      success: true,
      data: { requests: users },
    });
  } catch (error) {
    next(error);
  }
};

export const approveKyc = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    UserModel.updateKycStatus(userId, 'approved');

    res.json({
      success: true,
      message: 'KYC approved successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const rejectKyc = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = UserModel.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    UserModel.updateKycStatus(userId, 'rejected');

    res.json({
      success: true,
      message: 'KYC rejected',
    });
  } catch (error) {
    next(error);
  }
};

export const getReports = async (req, res, next) => {
  try {
    const reports = db.prepare(`
      SELECT r.*,
        reporter.name as reporter_name,
        reported.name as reported_name
      FROM reports r
      JOIN users reporter ON r.reporter_id = reporter.id
      JOIN users reported ON r.reported_id = reported.id
      ORDER BY r.created_at DESC
    `).all();

    res.json({
      success: true,
      data: { reports },
    });
  } catch (error) {
    next(error);
  }
};

export const sendBroadcast = async (req, res, next) => {
  try {
    const { title, message, type } = req.body;

    // Get all users
    const users = db.prepare('SELECT id FROM users WHERE account_status = ?').all('active');

    const insertNotification = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);

    users.forEach((user) => {
      insertNotification.run(user.id, title, message, type);
    });

    res.json({
      success: true,
      message: `Broadcast sent to ${users.length} users`,
    });
  } catch (error) {
    next(error);
  }
};

export const getActivityLogs = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const logs = db.prepare(`
      SELECT l.*, u.name as user_name, u.email as user_email
      FROM activity_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, (page - 1) * limit);

    const total = db.prepare('SELECT COUNT(*) as total FROM activity_logs').get().total;

    res.json({
      success: true,
      data: {
        logs,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
