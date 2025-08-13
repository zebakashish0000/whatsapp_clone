import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get messages for a specific wa_id
router.get('/:waId', async (req, res) => {
  try {
    const { waId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ wa_id: waId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    res.json({
      messages: messages.reverse(),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ wa_id: waId })
      }
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Send new message (store only)
router.post('/', async (req, res) => {
  try {
    const io = req.app.get('io');
    const { wa_id, body, type = 'text' } = req.body;

    if (!wa_id || !body) {
      return res.status(400).json({ error: 'wa_id and body are required' });
    }

    const messageData = {
      id: `out_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      wa_id,
      body,
      type,
      timestamp: new Date(),
      status: 'sent',
      direction: 'outgoing',
      from: 'business_phone_number',
      to: wa_id,
      profile_name: 'Business'
    };

    const newMessage = new Message(messageData);
    await newMessage.save();

    // Emit real-time update
    io.to(wa_id).emit('new-message', newMessage);
    io.emit('conversation-update', { wa_id, lastMessage: newMessage });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Update message status
router.patch('/:id/status', async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id } = req.params;
    const { status } = req.body;

    const message = await Message.findOneAndUpdate(
      { $or: [{ id }, { meta_msg_id: id }] },
      { status },
      { new: true }
    );

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Emit status update
    io.to(message.wa_id).emit('message-status-update', {
      id: message.id,
      status
    });

    res.json(message);
  } catch (error) {
    console.error('Error updating message status:', error);
    res.status(500).json({ error: 'Failed to update message status' });
  }
});

export default router;