import { UserModel } from '../models/user.model.js';
import { HostModel } from '../models/host.model.js';
import { RequestModel } from '../models/request.model.js';
import { ReviewModel } from '../models/review.model.js';
import { ActivityLogModel } from '../models/activityLog.model.js';
import db from '../config/database.js';

export const getStatistics = async (req, res, next) => {
  try {
    const totalUsers = UserModel.count();
    const totalHosts = UserModel.count({ role: 'host' });
    const totalTravelers = UserModel.count({ role: 'traveler' });
    const totalRequests = RequestModel.count();

    res.json({
      success: true,
      data: {
        totalUsers,
        totalHosts,
        totalTravelers,
        totalRequests,
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


