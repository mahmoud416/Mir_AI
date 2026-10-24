import { get, post, del } from './apiClient';
import type {
  ChatSendRequest,
  ChatResponse,
  Conversation,
  Message,
} from '../types/chat';

// ─── Chat Service ─────────────────────────────────────────────────────────────
// Endpoint contracts:
// POST   /api/v1/chat                              → send a message
// GET    /api/v1/conversations                     → list all conversations from DB
// GET    /api/v1/conversations/:id                 → get conversation metadata
// GET    /api/v1/conversations/:id/messages        → get messages for a conversation
// DELETE /api/v1/conversations/:id                 → delete conversation and messages

export const chatService = {
  /**
   * POST /api/v1/chat
   * Sends a user message and returns the AI response.
   */
  sendMessage: (payload: ChatSendRequest): Promise<ChatResponse> =>
    post<ChatResponse>('/api/v1/chat', payload),

  /**
   * GET /api/v1/conversations
   * Returns list of all stored conversations from MongoDB.
   */
  getConversations: (): Promise<Conversation[]> =>
    get<Conversation[]>('/api/v1/conversations'),

  /**
   * GET /api/v1/conversations/:id
   * Returns conversation metadata.
   */
  getConversation: (conversationId: string): Promise<Conversation> =>
    get<Conversation>(`/api/v1/conversations/${conversationId}`),

  /**
   * GET /api/v1/conversations/:id/messages
   * Returns all messages for a conversation from MongoDB.
   */
  getMessages: (conversationId: string): Promise<Message[]> =>
    get<Message[]>(`/api/v1/conversations/${conversationId}/messages`),

  /**
   * DELETE /api/v1/conversations/:id
   * Deletes a conversation and its messages.
   */
  deleteConversation: (conversationId: string): Promise<void> =>
    del<void>(`/api/v1/conversations/${conversationId}`),
};
