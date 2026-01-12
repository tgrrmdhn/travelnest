import express from 'express';
import { body } from 'express-validator';
import { validate } from '../middleware/validation.middleware.js';
import { authenticate } from '../middleware/auth.middleware.js';
import * as chatController from '../controllers/chat.controller.js';

const router = express.Router();

router.use(authenticate);

router.post(
  '/send',
  [
    body('receiver_id').isInt({ min: 1 }).withMessage('Invalid receiver ID'),
    body('message').trim().notEmpty().withMessage('Message is required')
      .isLength({ min: 1, max: 2000 }).withMessage('Message must be 1-2000 characters'),
    validate,
  ],
  chatController.sendMessage
);

router.get('/conversations', chatController.getConversations);
router.get('/conversation/:userId', chatController.getConversation);
router.put('/read/:userId', chatController.markAsRead);
router.get('/unread', chatController.getUnreadCount);

export default router;