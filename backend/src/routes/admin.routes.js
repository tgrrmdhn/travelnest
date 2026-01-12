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

export default router;
