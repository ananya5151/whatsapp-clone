// server/controllers/messageController.js
const Message = require('../models/Message');

// Get all unique conversations (latest message for each user)
exports.getConversations = async (req, res) => {
    try {
        // This is a complex query to get the last message for each conversation
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$wa_id",
                    name: { $first: "$name" },
                    lastMessage: { $first: "$body" },
                    lastMessageTimestamp: { $first: "$timestamp" },
                    unreadCount: { // Advanced: Count unread messages
                        $sum: {
                            $cond: [{ $and: [{ $eq: ["$status", "delivered"] }, { $eq: ["$from_me", false] }] }, 1, 0]
                        }
                    }
                }
            },
            { $sort: { lastMessageTimestamp: -1 } }
        ]);
        res.json(conversations);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Get all messages for a specific user (wa_id)
exports.getMessagesByWaId = async (req, res) => {
    try {
        const messages = await Message.find({ wa_id: req.params.wa_id }).sort({ timestamp: 'asc' });
        res.json(messages);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

// Save a new message sent from our UI
exports.sendMessage = async (req, res) => {
    const { wa_id, name, body } = req.body;
    try {
        const newMessage = new Message({
            wa_id,
            name,
            body,
            message_id: `demo_${new Date().getTime()}`, // Generate a unique demo ID
            from_me: true,
            timestamp: new Date(),
            status: 'sent' // Initially 'sent'
        });
        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};