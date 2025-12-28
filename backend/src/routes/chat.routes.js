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
    body('receiver_id').isInt().withMessage('Invalid receiver ID'),
    body('message').notEmpty().withMessage('Message is required'),
    validate,
  ],
  chatController.sendMessage
);

router.get('/conversations', chatController.getConversations);
router.get('/conversations/:userId', chatController.getConversation);
router.put('/conversations/:userId/read', chatController.markAsRead);
router.get('/unread-count', chatController.getUnreadCount);

export default router;