import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';
import { NotificationModel } from '../models/notification.model.js';

export const getProfile = async (req, res, next) => {
  try {
    const user = UserModel.findById(req.user.id);
    delete user.password;

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updates = {};

    if (name) updates.name = name;
    if (phone) updates.phone = phone;

    UserModel.update(req.user.id, updates);

    const user = UserModel.findById(req.user.id);
    delete user.password;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = UserModel.findById(req.user.id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect',
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    UserModel.update(req.user.id, { password: hashedPassword });

    res.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const avatarPath = `/uploads/profiles/${req.file.filename}`;

    UserModel.update(req.user.id, { avatar: avatarPath });

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { avatar: avatarPath },
    });
  } catch (error) {
    next(error);
  }
};

export const uploadKycDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const documentPath = `/uploads/kyc/${req.file.filename}`;

    UserModel.update(req.user.id, { 
      kyc_document: documentPath,
      kyc_status: 'pending'
    });

    res.json({
      success: true,
      message: 'KYC document uploaded successfully',
      data: { document: documentPath },
    });
  } catch (error) {
    next(error);
  }
};

export const getNotifications = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const notifications = NotificationModel.findByUserId(req.user.id, limit);

    res.json({
      success: true,
      data: { notifications },
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;

    NotificationModel.markAsRead(notificationId);

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsAsRead = async (req, res, next) => {
  try {
    NotificationModel.markAllAsRead(req.user.id);

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const count = NotificationModel.getUnreadCount(req.user.id);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
