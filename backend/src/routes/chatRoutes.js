const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { authenticateJWT } = require('../middlewares/authMiddleware');

/**
 * Chat Routes
 * Base path: /api/chat
 */

// POST /api/chat/conversation - Get or create a conversation
router.post('/conversation', authenticateJWT, chatController.getOrCreateConversation);

// GET /api/chat/conversations/:userId/:userType - Get all conversations for a user
router.get('/conversations/:userId/:userType', authenticateJWT, chatController.getUserConversations);

// GET /api/chat/messages/:conversationId - Get messages for a conversation
router.get('/messages/:conversationId', authenticateJWT, chatController.getMessages);

// POST /api/chat/message - Send a message
router.post('/message', authenticateJWT, chatController.sendMessage);

// PUT /api/chat/message/:messageId - Edit a message
router.put('/message/:messageId', authenticateJWT, chatController.editMessage);

// DELETE /api/chat/message/:messageId - Delete a message
router.delete('/message/:messageId', authenticateJWT, chatController.deleteMessage);

// POST /api/chat/read/:conversationId - Mark messages as read
router.post('/read/:conversationId', authenticateJWT, chatController.markAsRead);

module.exports = router;
