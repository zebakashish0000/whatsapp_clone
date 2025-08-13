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
    // ✅ Always use env var
    const socketUrl = import.meta.env.VITE_SOCKET_URL;

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log(`✅ Connected to socket server: ${socket.id}`);
    });

    socket.on('connect_error', (err) => {
      console.error('❌ Socket connection error:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.warn(`⚠️ Disconnected from socket server: ${reason}`);
    });

    socket.on('new-message', (message: Message) => onNewMessage?.(message));
    socket.on('message-status-update', (data: { id: string; status: string }) => onMessageStatusUpdate?.(data));
    socket.on('conversation-update', (data: { wa_id: string; lastMessage: Message }) => onConversationUpdate?.(data));

    return () => {
      socket.disconnect();
      console.log('🔌 Socket disconnected on unmount');
    };
  }, [onNewMessage, onMessageStatusUpdate, onConversationUpdate]);

  const joinConversation = (waId: string) => socketRef.current?.emit('join-conversation', waId);
  const leaveConversation = (waId: string) => socketRef.current?.emit('leave-conversation', waId);
  const sendMessage = (message: Message) => socketRef.current?.emit('send-message', message);

  return { joinConversation, leaveConversation, sendMessage };
};
