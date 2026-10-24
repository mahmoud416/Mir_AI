// ─── Ticket Types ─────────────────────────────────────────────────────────────

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed' | 'escalated';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type TicketCategory =
  | 'password_reset'
  | 'account_locked'
  | 'mfa'
  | 'windows'
  | 'active_directory'
  | 'network'
  | 'microsoft_365'
  | 'account'
  | 'general'
  | 'other'
  | (string & {});
export type TicketSource = 'demo' | 'sap' | 'mongodb_demo';

export interface TicketStatusHistory {
  status: TicketStatus;
  changedAt: string;
  changedBy?: string;
  note?: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  title?: string;
  subjectAr?: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  source: TicketSource;
  sapConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  customerReference?: string;
  conversationId?: string;
  conversation_id?: string;
  assignedAgent?: string;
  statusHistory?: TicketStatusHistory[];
}

export interface TicketCreateRequest {
  subject: string;
  title?: string;
  description: string;
  priority: TicketPriority;
  category: TicketCategory;
  conversationId?: string;
  conversation_id?: string;
  customerReference?: string;
  userId?: string;
  user_id?: string;
}

export interface TicketListFilters {
  status?: TicketStatus;
  priority?: TicketPriority;
  category?: TicketCategory;
  search?: string;
  page?: number;
  limit?: number;
}

export interface TicketListResponse {
  tickets: Ticket[];
  items?: Ticket[];
  total: number;
  page: number;
  limit: number;
}
