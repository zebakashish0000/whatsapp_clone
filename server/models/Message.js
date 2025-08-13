 import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  meta_msg_id: { type: String, sparse: true },
  wa_id: { type: String, required: true, index: true },
  profile_name: { type: String, default: '' },
  body: { type: String, required: true },
  type: { type: String, enum: ['text', 'image', 'document', 'audio', 'video'], default: 'text' },
  timestamp: { type: Date, required: true },
  status: { type: String, enum: ['sent', 'delivered', 'read', 'failed'], default: 'sent' },
  direction: { type: String, enum: ['incoming', 'outgoing'], required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  webhook_data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, {
  timestamps: true,
  collection: 'WP Data'
});

// Indexes
messageSchema.index({ wa_id: 1, timestamp: -1 });
messageSchema.index({ wa_id: 1, direction: 1, status: 1 });

// Prevent duplicate model compilation
export default mongoose.models.Message || mongoose.model('Message', messageSchema);
