 import axios from "axios";

/**
 * Safe environment variable getter
 * Works in both Vite (frontend) and Node.js (backend)
 */
function getEnvVar(key: string, fallback: string): string {
  // Vite env (frontend)
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key] as string;
  }
  // Node.js env (backend)
  if (typeof process !== "undefined" && process.env && process.env[key] !== undefined) {
    return process.env[key] as string;
  }
  return fallback;
}

/**
 * Detect current environment mode safely
 */
const mode =
  (typeof import.meta !== "undefined" && import.meta.env?.MODE) ||
  (typeof process !== "undefined" && process.env?.NODE_ENV) ||
  "development";

/**
 * Determine API Base URL
 */
const API_BASE_URL =
  mode === "development"
    ? getEnvVar("VITE_API_URL", "http://localhost:3001/api")
    : getEnvVar("VITE_API_URL", "https://whatsapp-clone-fmhf.onrender.com/api");

console.log(`📡 Mode: ${mode} | API: ${API_BASE_URL}`);

/**
 * Axios instance
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
});

/**
 * Conversations API
 */
export const conversationAPI = {
  async getConversations() {
    const res = await api.get("/conversations");
    return res.data;
  },
};

/**
 * Messages API
 */
export const messageAPI = {
  async getMessages(waId: string, page = 1, limit = 50) {
    const res = await api.get(`/messages/${waId}`, {
      params: { page, limit },
    });
    return res.data;
  },
};

export default api;
