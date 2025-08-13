 import express from 'express';
import Message from '../models/Message.js';

const router = express.Router();

/**
 * WhatsApp Webhook Verification
 */
router.get('/', (req, res) => {
  const VERIFY_TOKEN = process.env.VERIFY_TOKEN || 'your-verify-token';
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook] Verified');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  return res.sendStatus(400);
});

/**
 * Process WhatsApp webhook payloads
 */
router.post('/', async (req, res) => {
  try {
    const io = req.app.get('io');
    const body = req.body;

    console.log('[Webhook] Incoming payload:', JSON.stringify(body, null, 2));

    if (body.object === 'whatsapp_business_account') {
      for (const entry of body.entry || []) {
        for (const change of entry.changes || []) {
          if (change.field === 'messages') {
            await processMessages(change.value, io);
            await processStatuses(change.value, io);
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error('[Webhook] Processing error:', err);
    res.sendStatus(500);
  }
});

/**
 * Save new incoming messages and emit to browser
 */
async function processMessages(value, io) {
  const messages = value.messages || [];

  for (const msg of messages) {
    const messageData = {
      id: msg.id,
      wa_id: msg.from,
      profile_name: value.contacts?.[0]?.profile?.name || '',
      body: msg.text?.body || msg.caption || 'Media message',
      type: msg.type || 'text',
      timestamp: new Date(parseInt(msg.timestamp) * 1000),
      status: 'sent', // start as sent
      direction: 'incoming',
      from: msg.from,
      to: value.metadata?.phone_number_id || '',
      webhook_data: msg
    };

    try {
      const exists = await Message.findOne({ id: msg.id });
      if (!exists) {
        const newMsg = await Message.create(messageData);

        // Emit the new message to that conversation
        io.to(msg.from).emit('new-message', newMsg);

        // Emit conversation list update
        io.emit('conversation-update', {
          wa_id: msg.from,
          lastMessage: newMsg
        });

        console.log('[Webhook] Saved new message:', msg.id);
      }
    } catch (err) {
      console.error('[Webhook] Message save error:', err);
    }
  }
}

/**
 * Update message status (sent/delivered/read) in DB and in browser
 */
async function processStatuses(value, io) {
  const statuses = value.statuses || [];

  for (const s of statuses) {
    try {
      // Update the message status in DB
      const updated = await Message.findOneAndUpdate(
        {
          $or: [{ id: s.id }, { meta_msg_id: s.id }]
        },
        {
          status: s.status,
          $setOnInsert: { meta_msg_id: s.id }
        },
        { new: true }
      );

      if (updated) {
        console.log(`[Webhook] Status updated for ${updated.id}: ${s.status}`);

        // Emit to only the relevant conversation room
        io.to(updated.wa_id).emit('message-status-update', {
          id: updated.id,
          status: s.status
        });

        // ALSO update the conversation list so "lastMessage.status" changes in UI
        io.emit('conversation-update', {
          wa_id: updated.wa_id,
          lastMessage: updated
        });
      } else {
        console.warn(`[Webhook] No message found for status update: ${s.id}`);
      }
    } catch (err) {
      console.error('[Webhook] Status update error:', err);
    }
  }
}

export default router;
