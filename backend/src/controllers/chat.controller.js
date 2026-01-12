import { ChatModel } from '../models/chat.model.js';
import { RequestModel } from '../models/request.model.js';
import { HostModel } from '../models/host.model.js';
import { sanitizeString } from '../utils/sanitizer.js';
import db from '../config/database.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, message } = req.body;

    // Sanitize message to prevent XSS
    const sanitizedMessage = sanitizeString(message);

    // Check if users have an accepted request between them
    const hasAcceptedRequest = db.prepare(`
      SELECT r.id FROM requests r
      LEFT JOIN hosts h ON r.host_id = h.id
      WHERE r.status = 'accepted'
        AND ((r.traveler_id = ? AND h.user_id = ?)
         OR (r.traveler_id = ? AND h.user_id = ?))
    `).get(req.user.id, receiver_id, receiver_id, req.user.id);

    if (!hasAcceptedRequest) {
      return res.status(403).json({
        success: false,
        message: 'Chat is only allowed between users with accepted booking requests',
      });
    }

    const result = ChatModel.create({
      sender_id: req.user.id,
      receiver_id,
      message: sanitizedMessage,
    });

    const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(result.lastInsertRowid);

    // Log for admin monitoring
    console.log(`[ADMIN LOG] Message sent - From: ${req.user.id}, To: ${receiver_id}, Length: ${sanitizedMessage.length} chars`);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { chat },
    });
  } catch (error) {
    console.error(`[ADMIN LOG] Error sending message - User ID: ${req.user.id}, Error: ${error.message}`);
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = ChatModel.getConversation(req.user.id, userId, limit);

    // Debug: log the retrieved messages
    console.log(`📨 [DEBUG] getConversation - User ${req.user.id} with ${userId}:`);
    console.log(`   Found ${messages.length} messages`);
    if (messages.length > 0) {
      console.log(`   Sender IDs: ${[...new Set(messages.map(m => m.sender_id))].join(', ')}`);
      messages.forEach(msg => {
        console.log(`   - ID:${msg.id} From:${msg.sender_id} To:${msg.receiver_id} "${msg.message.substring(0, 30)}..."`);
      });
    }

    // Mark messages as read
    ChatModel.markAsRead(userId, req.user.id);

    res.json({
      success: true,
      data: { messages },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const conversations = ChatModel.getConversations(req.user.id);

    res.json({
      success: true,
      data: { conversations },
    });
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { userId } = req.params;

    ChatModel.markAsRead(userId, req.user.id);

    res.json({
      success: true,
      message: 'Messages marked as read',
    });
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (req, res, next) => {
  try {
    const count = ChatModel.getUnreadCount(req.user.id);
    const unreadByUser = ChatModel.getUnreadCountByUser(req.user.id);

    res.json({
      success: true,
      data: { 
        count,
        unreadByUser 
      },
    });
  } catch (error) {
    next(error);
  }
};
