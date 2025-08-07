// server/controllers/messageController.js
const Message = require('../models/Message');

// Get all unique conversations (latest message for each user)
exports.getConversations = async (req, res) => {
    try {
        const conversations = await Message.aggregate([
            { $sort: { timestamp: -1 } },
            {
                $group: {
                    _id: "$wa_id",
                    name: { $first: "$name" },
                    lastMessage: { $first: "$body" },
                    lastMessageTimestamp: { $first: "$timestamp" },
                    unreadCount: {
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
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

// Get all messages for a specific user (wa_id)
exports.getMessagesByWaId = async (req, res) => {
    try {
        const messages = await Message.find({ wa_id: req.params.wa_id }).sort({ timestamp: 'asc' });
        res.json(messages);
    } catch (err) {
        console.error(err.message);
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
            message_id: `demo_${new Date().getTime()}`,
            from_me: true,
            timestamp: new Date(),
            status: 'sent'
        });
        await newMessage.save();

        // *** REAL-TIME MAGIC: Emit the new message to all clients ***
        req.io.emit('newMessage', newMessage);
        // Also emit an update for the conversation list
        req.io.emit('updateConversation', {
             _id: wa_id,
             name: name,
             lastMessage: body,
             lastMessageTimestamp: newMessage.timestamp,
        });

        res.status(201).json(newMessage);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};