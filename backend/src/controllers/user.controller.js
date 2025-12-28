import bcrypt from 'bcryptjs';
import { UserModel } from '../models/user.model.js';

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
