import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import * as userController from '../controllers/user.controller.js';

const router = express.Router();

router.use(authenticate);

router.get('/profile', userController.getProfile);
router.put(
  '/profile',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
    validate,
  ],
  userController.updateProfile
);

router.put(
  '/password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
    validate,
  ],
  userController.updatePassword
);

router.post('/avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/kyc', upload.single('kyc_document'), userController.uploadKycDocument);

export default router;
