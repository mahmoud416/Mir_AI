import { get, post, patch } from './apiClient';
import type {
  Ticket,
  TicketCreateRequest,
  TicketListFilters,
  TicketListResponse,
} from '../types/ticket';

// ─── Ticket Service ───────────────────────────────────────────────────────────
// GET   /api/v1/tickets              → list tickets with filters
// GET   /api/v1/tickets/:id          → get ticket details
// POST  /api/v1/tickets              → create a new ticket
// PATCH /api/v1/tickets/:id          → update ticket status/priority

export const ticketService = {
  getTickets: (filters?: TicketListFilters): Promise<TicketListResponse> =>
    get<TicketListResponse>('/api/v1/tickets', filters as Record<string, unknown>),

  getTicket: (ticketId: string): Promise<Ticket> =>
    get<Ticket>(`/api/v1/tickets/${ticketId}`),

  createTicket: (payload: TicketCreateRequest): Promise<Ticket> =>
    post<Ticket>('/api/v1/tickets', payload),

  updateTicket: (
    ticketId: string,
    payload: { status?: string; priority?: string; note?: string }
  ): Promise<Ticket> =>
    patch<Ticket>(`/api/v1/tickets/${ticketId}`, payload),

  updateTicketStatus: (
    ticketId: string,
    status: string,
    note?: string
  ): Promise<Ticket> =>
    patch<Ticket>(`/api/v1/tickets/${ticketId}`, { status, note }),
};
