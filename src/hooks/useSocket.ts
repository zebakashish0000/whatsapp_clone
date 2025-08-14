import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Message } from "../types";

/**
 * Get environment variable safely (works in Vite + Node)
 */
function getEnvVar(key: string, fallback: string): string {
  if (typeof import.meta !== "undefined" && import.meta.env?.[key] !== undefined) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== "undefined" && process.env?.[key] !== undefined) {
    return process.env[key] as string;
  }
  return fallback;
}

const mode =
  (typeof import.meta !== "undefined" && import.meta.env?.MODE) ||
  (typeof process !== "undefined" && process.env?.NODE_ENV) ||
  "development";

/**
 * Determine Socket Server URL
 */
const SOCKET_URL =
  mode === "development"
    ? getEnvVar("VITE_SOCKET_URL", "http://localhost:3001")
    : getEnvVar("VITE_SOCKET_URL", "https://whatsapp-clone-fmhf.onrender.com");

console.log(`🔌 Mode: ${mode} | Socket: ${SOCKET_URL}`);

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
    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => console.log(`✅ Connected: ${socket.id}`));
    socket.on("connect_error", (err) => console.error("❌ Socket error:", err.message));
    socket.on("disconnect", (reason) => console.warn(`⚠️ Disconnected: ${reason}`));

    socket.on("new-message", (message: Message) => onNewMessage?.(message));
    socket.on("message-status-update", (data) => onMessageStatusUpdate?.(data));
    socket.on("conversation-update", (data) => onConversationUpdate?.(data));

    return () => {
      socket.disconnect();
      console.log("🔌 Socket disconnected");
    };
  }, [onNewMessage, onMessageStatusUpdate, onConversationUpdate]);

  const joinConversation = (waId: string) =>
    socketRef.current?.emit("join-conversation", waId);

  const leaveConversation = (waId: string) =>
    socketRef.current?.emit("leave-conversation", waId);

  const sendMessage = (message: Message) =>
    socketRef.current?.emit("send-message", message);

  return { joinConversation, leaveConversation, sendMessage };
};
