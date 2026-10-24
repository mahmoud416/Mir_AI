import React from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  Ticket,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  BookOpen,
  Eye,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { StatusBadge, PriorityBadge, timeAgo } from '../components/ui/Badges';
import { demoDashboardData } from '../services/demoData';

interface StatCardProps {
  id: string;
  icon: React.ElementType;
  value: number | string;
  label: string;
  change?: number;
  color: string;
  iconBg: string;
}

function StatCard({ id, icon: Icon, value, label, change, color, iconBg }: StatCardProps) {
  return (
    <div id={id} className="card hover:shadow-medium transition-all duration-200 group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        {change !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            {change >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{Math.abs(change)}%</span>
          </div>
        )}
      </div>
      <p className="text-3xl font-bold text-slate-800 dark:text-white mb-1">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';
  const data = demoDashboardData;

  const stats = [
    {
      id: 'stat-total-conversations',
      icon: MessageSquare,
      value: data.stats.totalConversations,
      label: t('statTotalConversations'),
      change: 12,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
    },
    {
      id: 'stat-open-tickets',
      icon: Ticket,
      value: data.stats.openTickets,
      label: t('statOpenTickets'),
      change: -3,
      color: 'text-amber-600',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
    },
    {
      id: 'stat-unresolved',
      icon: AlertTriangle,
      value: data.stats.unresolvedConversations,
      label: isEn ? 'Unresolved Chats' : 'محادثات غير محلولة',
      change: 5,
      color: 'text-red-600',
      iconBg: 'bg-red-50 dark:bg-red-900/30',
    },
    {
      id: 'stat-escalated',
      icon: ArrowUpRight,
      value: data.stats.escalatedCases,
      label: isEn ? 'Escalated Cases' : 'حالات مُصعَّدة',
      change: -1,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('dashTitle')}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">{t('dashSubtitle')}</p>
        </div>
        <DemoBanner />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s) => <StatCard key={s.id} {...s} />)}
      </div>

      {/* Resolution & Escalation rates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isEn ? 'Resolution Rate' : 'معدل الحل'}
            </h3>
            <span className="text-2xl font-bold text-green-600">{data.stats.resolutionRate}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${data.stats.resolutionRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isEn ? 'Of total support conversations' : 'من إجمالي المحادثات'}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {isEn ? 'Escalation Rate' : 'معدل التصعيد'}
            </h3>
            <span className="text-2xl font-bold text-red-500">{data.stats.escalationRate}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5">
            <div
              className="bg-red-400 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${data.stats.escalationRate}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {isEn ? 'Cases escalated to Tier-2 engineers' : 'محادثات تم تصعيدها للدعم البشري'}
          </p>
        </div>
      </div>

      {/* Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent conversations */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {isEn ? 'Recent Conversations' : 'آخر المحادثات'}
            </h2>
            <Link to="/chat" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              {t('viewAll')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentConversations.map((conv) => (
              <div
                key={conv.id}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-4 h-4 text-primary-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{conv.title}</p>
                  <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {timeAgo(conv.createdAt)}
                  </p>
                </div>
                <span className={`badge-${conv.status} flex-shrink-0`}>
                  {conv.status === 'active'
                    ? isEn ? 'Active' : 'نشط'
                    : conv.status === 'resolved'
                    ? isEn ? 'Resolved' : 'محلول'
                    : isEn ? 'Escalated' : 'مُصعَّد'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent tickets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-800 dark:text-white">
              {isEn ? 'Recent Tickets' : 'آخر التذاكر'}
            </h2>
            <Link to="/tickets" className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1">
              {t('viewAll')} <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {data.recentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Ticket className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">
                    {isEn ? ticket.subject : ticket.subjectAr || ticket.subject}
                  </p>
                  <p className="text-xs text-slate-400 font-mono">{ticket.ticketNumber}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <StatusBadge status={ticket.status as any} />
                    <PriorityBadge priority={ticket.priority as any} />
                  </div>
                </div>
                <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(ticket.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <h2 className="text-base font-bold text-slate-800 dark:text-white mb-4">
          {t('dashQuickActions')}
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/tickets?status=open"
            id="quick-action-open-tickets"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-700 dark:text-blue-300 transition-colors"
          >
            <Eye className="w-6 h-6" />
            <span className="text-sm font-medium text-center">{t('statOpenTickets')}</span>
          </Link>
          <Link
            to="/chat"
            id="quick-action-unresolved"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-300 transition-colors"
          >
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-medium text-center">
              {isEn ? 'Unresolved Chats' : 'المحادثات غير المحلولة'}
            </span>
          </Link>
          <Link
            to="/knowledge-base"
            id="quick-action-kb"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-700 dark:text-green-300 transition-colors"
          >
            <BookOpen className="w-6 h-6" />
            <span className="text-sm font-medium text-center">{t('navKnowledgeBase')}</span>
          </Link>
          <Link
            to="/tickets/new"
            id="quick-action-new-ticket"
            className="flex flex-col items-center gap-2 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 text-purple-700 dark:text-purple-300 transition-colors"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm font-medium text-center">
              {isEn ? 'New Demo Ticket' : 'تذكرة تجريبية'}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
