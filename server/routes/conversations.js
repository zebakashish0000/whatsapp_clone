import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

// Get all conversations with last message
router.get('/', async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      {
        $sort: { wa_id: 1, timestamp: -1 }
      },
      {
        $group: {
          _id: '$wa_id',
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$direction', 'incoming'] },
                    { $ne: ['$status', 'read'] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $project: {
          wa_id: '$_id',
          profile_name: '$lastMessage.profile_name',
          lastMessage: {
            body: '$lastMessage.body',
            timestamp: '$lastMessage.timestamp',
            type: '$lastMessage.type',
            status: '$lastMessage.status',
            direction: '$lastMessage.direction'
          },
          unreadCount: 1
        }
      },
      {
        $sort: { 'lastMessage.timestamp': -1 }
      }
    ]).option({ maxTimeMS: 30000 });

    res.json(conversations);
  } catch (error) {
    console.error('Error fetching conversations:', error);
    res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Mark conversation as read
router.patch('/:waId/read', async (req, res) => {
  try {
    const { waId } = req.params;
    
    await Message.updateMany(
      { 
        wa_id: waId,
        direction: 'incoming',
        status: { $ne: 'read' }
      },
      { status: 'read' }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking conversation as read:', error);
    res.status(500).json({ error: 'Failed to mark conversation as read' });
  }
});

export default router;