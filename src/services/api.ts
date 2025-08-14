 import axios from 'axios';
import { Message, Conversation } from '../types';

// ✅ Always use VITE_API_URL from .env / .env.local, with localhost fallback
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

console.log('📡 API URL in use:', API_BASE); // debug log

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

export const messageAPI = {
  getMessages: async (waId: string, page = 1, limit = 50) => {
    const response = await api.get(`/messages/${waId}?page=${page}&limit=${limit}`);
    return response.data;
  },
  sendMessage: async (waId: string, body: string, type = 'text') => {
    const response = await api.post('/messages', { wa_id: waId, body, type });
    return response.data;
  },
  updateMessageStatus: async (id: string, status: string) => {
    const response = await api.patch(`/messages/${id}/status`, { status });
    return response.data;
  },
};

export const conversationAPI = {
  getConversations: async (): Promise<Conversation[]> => {
    const response = await api.get('/conversations');
    return response.data;
  },
  markAsRead: async (waId: string) => {
    const response = await api.patch(`/conversations/${waId}/read`);
    return response.data;
  },
};

export const webhookAPI = {
  simulateWebhook: async (payload: any) => {
    const response = await api.post('/webhook', payload);
    return response.data;
  },
};
