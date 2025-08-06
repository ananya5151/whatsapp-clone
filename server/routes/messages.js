// server/routes/messages.js
const express = require('express');
const router = express.Router();
const { getConversations, getMessagesByWaId, sendMessage } = require('../controllers/messageController');

// @route   GET api/conversations
// @desc    Get all unique conversations
router.get('/conversations', getConversations);

// @route   GET api/messages/:wa_id
// @desc    Get all messages for a user
router.get('/messages/:wa_id', getMessagesByWaId);

// @route   POST api/messages/send
// @desc    Send a new message (for demo)
router.post('/send', sendMessage);

module.exports = router;