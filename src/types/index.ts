export interface Message {
  _id: string;
  id: string;
  meta_msg_id?: string;
  wa_id: string;
  profile_name: string;
  body: string;
  type: 'text' | 'image' | 'document' | 'audio' | 'video';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  direction: 'incoming' | 'outgoing';
  from: string;
  to: string;
  webhook_data?: any;
}

export interface Conversation {
  wa_id: string;
  profile_name: string;
  lastMessage: {
    body: string;
    timestamp: string;
    type: string;
    status: string;
    direction: string;
  };
  unreadCount: number;
}

export interface SocketMessage {
  type: 'new-message' | 'message-status-update' | 'conversation-update';
  data: any;
}