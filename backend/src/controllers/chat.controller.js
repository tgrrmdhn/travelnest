import { ChatModel } from '../models/chat.model.js';

export const sendMessage = async (req, res, next) => {
  try {
    const { receiver_id, message } = req.body;

    const result = ChatModel.create({
      sender_id: req.user.id,
      receiver_id,
      message,
    });

    const chat = db.prepare('SELECT * FROM chats WHERE id = ?').get(result.lastInsertRowid);

    res.status(201).json({
      success: true,
      message: 'Message sent',
      data: { chat },
    });
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;

    const messages = ChatModel.getConversation(req.user.id, userId, limit);

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

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};
