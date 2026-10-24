import { get } from './apiClient';
import type { DashboardData } from '../types/dashboard';

// ─── Dashboard Service ────────────────────────────────────────────────────────
// GET /api/v1/dashboard/stats → returns stats, recent conversations, recent tickets

export const dashboardService = {
  getStats: (): Promise<DashboardData> => get<DashboardData>('/api/v1/dashboard/stats'),
};
