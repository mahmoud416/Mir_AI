// ─── Chat & Conversation Types ───────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';
export type MessageStatus = 'sending' | 'sent' | 'error';
export type AccountType = 'personal' | 'work_school' | 'domain';

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  status?: MessageStatus;
  metadata?: Record<string, unknown>;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  messageCount?: number;
  message_count?: number;
  status: 'active' | 'resolved' | 'escalated';
  category?: string;
  ticketId?: string;
  ticket_id?: string;
}

export interface ChatSendRequest {
  conversationId?: string;
  message: string;
  accountType?: AccountType;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  suggestedActions?: SuggestedAction[];
  ticketCreated?: TicketCreatedInfo;
}

export interface SuggestedAction {
  id: string;
  label: string;
  labelAr: string;
  type: 'account_type' | 'issue_type' | 'escalate' | 'link';
  value?: string;
  url?: string;
}

export interface TicketCreatedInfo {
  ticketNumber: string;
  status: string;
  createdAt: string;
  sapConfirmed: boolean;
}
