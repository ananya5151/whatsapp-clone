// server/models/Message.js
const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  wa_id: { type: String, required: true }, // User's WhatsApp ID
  name: { type: String, required: true }, // User's Name
  message_id: { type: String, required: true, unique: true }, // WhatsApp's message ID
  body: { type: String, required: true }, // The text of the message
  from_me: { type: Boolean, required: true }, // True if sent from us, false if received
  timestamp: { type: Date, required: true },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'failed', 'pending'],
    default: 'sent'
  }
});

// Create an index on wa_id to quickly fetch conversations
MessageSchema.index({ wa_id: 1 });

module.exports = mongoose.model('processed_message', MessageSchema);