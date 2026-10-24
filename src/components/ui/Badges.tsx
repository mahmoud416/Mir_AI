import React from 'react';
import type { TicketStatus, TicketPriority } from '../../types/ticket';
import { useApp } from '../../context/AppContext';

const STATUS_LABELS_AR: Record<TicketStatus, string> = {
  open: 'مفتوح',
  in_progress: 'قيد المعالجة',
  resolved: 'محلول',
  closed: 'مغلق',
  escalated: 'مُصعَّد',
};

const STATUS_LABELS_EN: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
  escalated: 'Escalated',
};

const PRIORITY_LABELS_AR: Record<TicketPriority, string> = {
  low: 'منخفض',
  medium: 'متوسط',
  high: 'عالي',
  critical: 'حرج',
};

const PRIORITY_LABELS_EN: Record<TicketPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const { language } = useApp();
  const labels = language === 'en' ? STATUS_LABELS_EN : STATUS_LABELS_AR;
  return (
    <span className={`badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TicketPriority }) {
  const { language } = useApp();
  const labels = language === 'en' ? PRIORITY_LABELS_EN : PRIORITY_LABELS_AR;
  return (
    <span className={`badge-${priority}`}>
      {labels[priority] || priority}
    </span>
  );
}

export function formatDate(dateStr: string, lang = 'ar'): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateStr;
  }
}

export function timeAgo(dateStr: string, lang = 'ar'): string {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const isEn = lang === 'en';
    if (diffMins < 1) return isEn ? 'Just now' : 'الآن';
    if (diffMins < 60) return isEn ? `${diffMins}m ago` : `منذ ${diffMins} دقيقة`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return isEn ? `${diffHours}h ago` : `منذ ${diffHours} ساعة`;
    const diffDays = Math.floor(diffHours / 24);
    return isEn ? `${diffDays}d ago` : `منذ ${diffDays} يوم`;
  } catch {
    return dateStr;
  }
}
