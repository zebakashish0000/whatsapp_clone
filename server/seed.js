 // server/seed.js
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Message from './models/Message.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in .env');
  process.exit(1);
}

// Convert UNIX timestamp (string) to Date
function parseTimestamp(ts) {
  return new Date(parseInt(ts, 10) * 1000);
}

(async () => {
  try {
    // Connect to Mongo
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Path to your external webhook payloads
    const folderPath = path.join(process.cwd(), 'server', 'external_webhooks');
    const files = fs.readdirSync(folderPath);

    if (!files.length) {
      console.warn('⚠️ No JSON files found in external_webhooks folder');
      process.exit(0);
    }

    for (const file of files) {
      if (!file.endsWith('.json')) continue;

      const raw = fs.readFileSync(path.join(folderPath, file), 'utf8');
      const data = JSON.parse(raw);
      const value = data?.metaData?.entry?.[0]?.changes?.[0]?.value;

      if (!value) {
        console.warn(`⚠️ Skipping ${file} → No "value" found`);
        continue;
      }

      // Insert messages
      if (value.messages) {
        const contact = value.contacts?.[0];
        for (const msg of value.messages) {
          const messageDoc = {
            id: msg.id,
            meta_msg_id: msg.id,
            wa_id: contact?.wa_id,
            profile_name: contact?.profile?.name || '',
            body: msg.text?.body || '',
            type: msg.type || 'text',
            timestamp: parseTimestamp(msg.timestamp),
            status: 'sent',
            direction: msg.from === contact?.wa_id ? 'incoming' : 'outgoing',
            from: msg.from,
            to: contact?.wa_id,
            webhook_data: data
          };

          await Message.findOneAndUpdate(
            { id: msg.id },
            messageDoc,
            { upsert: true }
          );
          console.log(`💬 Inserted/Updated message: ${msg.id}`);
        }
      }

      // Update statuses
      if (value.statuses) {
        for (const st of value.statuses) {
          await Message.findOneAndUpdate(
            { id: st.id },
            { status: st.status, webhook_data: data },
            { new: true }
          );
          console.log(`📌 Updated status for: ${st.id} → ${st.status}`);
        }
      }
    }

    console.log('🎉 All external webhook files processed and saved to DB');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  }
})();
