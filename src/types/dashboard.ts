// ─── Dashboard Types ──────────────────────────────────────────────────────────

export interface DashboardStats {
  totalConversations: number;
  openTickets: number;
  unresolvedConversations: number;
  escalatedCases: number;
  resolutionRate: number;
  escalationRate: number;
  avgResponseTime?: number;
}

export interface RecentConversation {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  category?: string;
}

export interface RecentTicket {
  id: string;
  ticketNumber: string;
  subject: string;
  subjectAr?: string;
  status: string;
  priority: string;
  createdAt: string;
  assignedAgent?: string;
}

export interface DashboardData {
  stats: DashboardStats;
  recentConversations: RecentConversation[];
  recentTickets: RecentTicket[];
}

export interface ReportDateRange {
  from: string;
  to: string;
}

export interface ConversationVolumePoint {
  date: string;
  count: number;
}

export interface CategoryDistributionPoint {
  category: string;
  categoryAr: string;
  count: number;
}

export interface TicketStatusPoint {
  status: string;
  statusAr: string;
  count: number;
  color: string;
}

export interface ReportsData {
  conversationVolume: ConversationVolumePoint[];
  categoryDistribution: CategoryDistributionPoint[];
  ticketStatusDistribution: TicketStatusPoint[];
  resolutionRate: number;
  escalationRate: number;
}
