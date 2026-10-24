import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  MessageSquare,
  ExternalLink,
  AlertCircle,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { StatusBadge, PriorityBadge, formatDate, timeAgo } from '../components/ui/Badges';
import { demoTickets } from '../services/demoData';
import { ticketService } from '../services/ticketService';
import type { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types/ticket';

const CATEGORY_KEYS: Record<string, string> = {
  password_reset: 'catPasswordReset',
  account_locked: 'catAccountLocked',
  mfa: 'catMfa',
  windows: 'catWindows',
  active_directory: 'catActiveDirectory',
  network: 'catNetwork',
  microsoft_365: 'catM365',
  account: 'catAccountLocked',
  general: 'catOther',
  other: 'catOther',
};

function TicketRow({
  ticket,
  isSelected,
  onClick,
  isEn,
}: {
  ticket: Ticket;
  isSelected: boolean;
  onClick: () => void;
  isEn: boolean;
}) {
  const { t, language } = useApp();
  const categoryLabel = t(CATEGORY_KEYS[ticket.category] as any) || ticket.category;

  return (
    <tr
      onClick={onClick}
      className={`cursor-pointer transition-colors ${
        isSelected
          ? 'bg-primary-50 dark:bg-primary-900/20'
          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
      } border-b border-slate-100 dark:border-slate-700`}
    >
      <td className="px-4 py-3">
        <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
          {ticket.ticketNumber || `TCKT-${ticket.id.slice(0, 8).toUpperCase()}`}
        </span>
      </td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {isEn ? ticket.subject : ticket.subjectAr || ticket.subject}
          </p>
          {(ticket.source === 'demo' || ticket.source === ('mongodb_demo' as any)) && (
            <span className="text-[10px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded font-medium">
              Demo
            </span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-500">{categoryLabel}</span>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={ticket.status} />
      </td>
      <td className="px-4 py-3">
        <PriorityBadge priority={ticket.priority} />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-slate-400">{timeAgo(ticket.createdAt, language)}</span>
      </td>
      <td className="px-4 py-3">
        {language === 'ar' ? (
          <ChevronLeft className="w-4 h-4 text-slate-300 mr-auto" />
        ) : (
          <ChevronRight className="w-4 h-4 text-slate-300 ml-auto" />
        )}
      </td>
    </tr>
  );
}

function TicketDetailPanel({
  ticket,
  onClose,
  onStatusChange,
  isEn,
}: {
  ticket: Ticket;
  onClose: () => void;
  onStatusChange?: (ticketId: string, newStatus: TicketStatus) => void;
  isEn: boolean;
}) {
  const { t, language } = useApp();
  const categoryLabel = t(CATEGORY_KEYS[ticket.category] as any) || ticket.category;

  return (
    <div className="w-full lg:w-96 border-s border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <span className="font-mono font-bold text-sm text-slate-700 dark:text-slate-300">
          {ticket.ticketNumber || `TCKT-${ticket.id.slice(0, 8).toUpperCase()}`}
        </span>
        <button
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors"
        >
          {t('cancel')}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <h2 className="text-base font-bold text-slate-800 dark:text-white leading-relaxed">
          {isEn ? ticket.subject : ticket.subjectAr || ticket.subject}
        </h2>

        {/* Status + priority */}
        <div className="flex items-center gap-2">
          <StatusBadge status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <span className="badge bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            {categoryLabel}
          </span>
        </div>

        {/* Status Actions */}
        <div className="pt-1 pb-1">
          <p className="text-xs text-slate-400 mb-1.5">{isEn ? 'Update Status:' : 'تحديث الحالة:'}</p>
          <div className="flex flex-wrap gap-1.5">
            {(['open', 'in_progress', 'resolved', 'closed'] as TicketStatus[]).map((st) => (
              <button
                key={st}
                disabled={ticket.status === st}
                onClick={() => onStatusChange?.(ticket.id, st)}
                className={`px-2 py-0.5 text-[11px] rounded-lg font-medium transition-colors border ${
                  ticket.status === st
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-transparent cursor-default'
                    : 'hover:bg-primary-50 dark:hover:bg-primary-900/30 text-primary-600 border-primary-200 dark:border-primary-800'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {ticket.description}
          </p>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-400 mb-1">{isEn ? 'Created At' : 'تاريخ الإنشاء'}</p>
            <p className="text-slate-700 dark:text-slate-200 text-xs">
              {formatDate(ticket.createdAt, language)}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">{isEn ? 'Updated At' : 'آخر تحديث'}</p>
            <p className="text-slate-700 dark:text-slate-200 text-xs">
              {formatDate(ticket.updatedAt, language)}
            </p>
          </div>
          {ticket.customerReference && (
            <div>
              <p className="text-xs text-slate-400 mb-1">{isEn ? 'Customer Ref' : 'مرجع العميل'}</p>
              <p className="text-slate-700 dark:text-slate-200 text-xs font-mono">
                {ticket.customerReference}
              </p>
            </div>
          )}
          {ticket.assignedAgent && (
            <div>
              <p className="text-xs text-slate-400 mb-1">{isEn ? 'Assigned Agent' : 'الوكيل المعيَّن'}</p>
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <p className="text-slate-700 dark:text-slate-200 text-xs">{ticket.assignedAgent}</p>
              </div>
            </div>
          )}
        </div>

        {/* SAP note */}
        {!ticket.sapConfirmed && (
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-300">
              {isEn
                ? 'This ticket is pending SAP sync. Official tickets will be synced from server.'
                : 'هذه التذكرة لم تُؤكَّد في SAP بعد. ستُعرض التذاكر الرسمية بعد تأكيد الخادم.'}
            </p>
          </div>
        )}

        {/* Conversation link */}
        {ticket.conversationId && (
          <Link
            to={`/chat?conv=${ticket.conversationId}`}
            className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
          >
            <MessageSquare className="w-4 h-4 text-primary-500" />
            <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary-600">
              {isEn ? 'View Linked Conversation' : 'عرض المحادثة المرتبطة'}
            </span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-300 ms-auto" />
          </Link>
        )}
      </div>
    </div>
  );
}

export default function TicketsPage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>(
    (searchParams.get('status') as TicketStatus) || ''
  );
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<TicketCategory | ''>('');
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTickets = useCallback(async () => {
    if (isDemo) {
      setTickets(demoTickets);
      return;
    }
    setIsLoading(true);
    try {
      const res = await ticketService.getTickets();
      const list = res.items || res.tickets || [];
      setTickets(list.length > 0 ? list : demoTickets);
    } catch (err) {
      console.warn('Failed to fetch tickets from backend, using demo data fallback:', err);
      setTickets(demoTickets);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleStatusChange = async (ticketId: string, newStatus: TicketStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const filtered = useMemo(() => {
    return tickets.filter((tkt) => {
      const matchSearch =
        !search ||
        tkt.ticketNumber.toLowerCase().includes(search.toLowerCase()) ||
        (tkt.subjectAr || tkt.subject).toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || tkt.status === statusFilter;
      const matchPriority = !priorityFilter || tkt.priority === priorityFilter;
      const matchCategory = !categoryFilter || tkt.category === categoryFilter;
      return matchSearch && matchStatus && matchPriority && matchCategory;
    });
  }, [tickets, search, statusFilter, priorityFilter, categoryFilter]);

  return (
    <div className="flex h-full">
      {/* Main table panel */}
      <div className={`flex flex-col ${selectedTicket ? 'hidden lg:flex lg:flex-1' : 'flex-1'}`}>
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
                {t('ticketsTitle')}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {filtered.length} {isEn ? 'Tickets' : 'تذكرة'}
                {isDemo && (
                  <span className="ms-2 text-amber-500 font-medium">
                    ({isEn ? 'Demo Data' : 'بيانات تجريبية'})
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DemoBanner />
              <Link to="/tickets/new" id="new-ticket-btn" className="btn-primary text-sm">
                <Plus className="w-4 h-4" />
                {t('createNewTicket')}
              </Link>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search
                className={`absolute ${
                  language === 'ar' ? 'right-3' : 'left-3'
                } top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none`}
              />
              <input
                id="ticket-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('searchTicketsPlaceholder')}
                className={`input-field ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
              />
            </div>
            <select
              id="ticket-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
              className="input-field w-auto min-w-36"
            >
              <option value="">{isEn ? 'All Statuses' : 'كل الحالات'}</option>
              <option value="open">{t('statusOpen')}</option>
              <option value="in_progress">{t('statusInProgress')}</option>
              <option value="resolved">{t('statusResolved')}</option>
              <option value="escalated">{t('statusEscalated')}</option>
              <option value="closed">{t('statusClosed')}</option>
            </select>
            <select
              id="ticket-priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')}
              className="input-field w-auto min-w-36"
            >
              <option value="">{isEn ? 'All Priorities' : 'كل الأولويات'}</option>
              <option value="low">{t('priorityLow')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="high">{t('priorityHigh')}</option>
              <option value="critical">{t('priorityCritical')}</option>
            </select>
            <select
              id="ticket-category-filter"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as TicketCategory | '')}
              className="input-field w-auto min-w-44"
            >
              <option value="">{isEn ? 'All Categories' : 'كل الفئات'}</option>
              {Object.entries(CATEGORY_KEYS).map(([k, v]) => (
                <option key={k} value={k}>
                  {t(v as any)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-3 text-start">{t('colTicketNumber')}</th>
                <th className="px-4 py-3 text-start">{t('colSubject')}</th>
                <th className="px-4 py-3 text-start">{t('colCategory')}</th>
                <th className="px-4 py-3 text-start">{t('colStatus')}</th>
                <th className="px-4 py-3 text-start">{t('colPriority')}</th>
                <th className="px-4 py-3 text-start">{t('colDate')}</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ticket) => (
                <TicketRow
                  key={ticket.id}
                  ticket={ticket}
                  isSelected={selectedTicket?.id === ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  isEn={isEn}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket detail drawer */}
      {selectedTicket && (
        <TicketDetailPanel
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          isEn={isEn}
        />
      )}
    </div>
  );
}
