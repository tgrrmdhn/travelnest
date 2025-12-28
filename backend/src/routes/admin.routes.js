import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

router.use(authenticate, authorize('admin'));

router.get('/statistics', adminController.getStatistics);
router.get('/users', adminController.getUsers);
router.put('/users/:userId/ban', adminController.banUser);
router.put('/users/:userId/unban', adminController.unbanUser);

router.get('/kyc', adminController.getKycRequests);
router.put('/kyc/:userId/approve', adminController.approveKyc);
router.put('/kyc/:userId/reject', adminController.rejectKyc);

router.get('/reports', adminController.getReports);
router.get('/activity-logs', adminController.getActivityLogs);

router.post(
  '/broadcast',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('message').notEmpty().withMessage('Message is required'),
    body('type').notEmpty().withMessage('Type is required'),
    validate,
  ],
  adminController.sendBroadcast
);

export default router;
