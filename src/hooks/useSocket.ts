 import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types';

interface UseSocketProps {
  onNewMessage?: (message: Message) => void;
  onMessageStatusUpdate?: (data: { id: string; status: string }) => void;
  onConversationUpdate?: (data: { wa_id: string; lastMessage: Message }) => void;
}

export const useSocket = ({
  onNewMessage,
  onMessageStatusUpdate,
  onConversationUpdate,
}: UseSocketProps) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // ✅ Socket server URL - use env var if available
    const socketUrl =
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

    // ✅ Init socket (allow default polling → upgrade to WS)
    const socket = io(socketUrl, {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    // --- Connection events ---
    socket.on('connect', () => {
      console.log(`✅ Connected to socket server: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected from socket server: ${reason}`);
    });

    // --- Custom app events ---
    socket.on('new-message', (message: Message) => {
      console.log('📩 New message received:', message);
      onNewMessage?.(message);
    });

    socket.on('message-status-update', (data: { id: string; status: string }) => {
      console.log('📊 Message status updated:', data);
      onMessageStatusUpdate?.(data);
    });

    socket.on('conversation-update', (data: { wa_id: string; lastMessage: Message }) => {
      console.log('🗂 Conversation updated:', data);
      onConversationUpdate?.(data);
    });

    // ✅ Cleanup on unmount
    return () => {
      socket.disconnect();
      console.log('🔌 Socket disconnected on component unmount');
    };
  }, [onNewMessage, onMessageStatusUpdate, onConversationUpdate]);

  // --- Emitters ---
  const joinConversation = (waId: string) => {
    socketRef.current?.emit('join-conversation', waId);
  };

  const leaveConversation = (waId: string) => {
    socketRef.current?.emit('leave-conversation', waId);
  };

  const sendMessage = (message: Message) => {
    socketRef.current?.emit('send-message', message);
  };

  return { joinConversation, leaveConversation, sendMessage };
};
