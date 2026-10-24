import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  MessageSquare,
  LayoutDashboard,
  Ticket,
  BookOpen,
  BarChart3,
  Users,
  Settings,
  Plus,
  HelpCircle,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { TranslationKey } from '../../i18n/translations';

const NAV_ITEMS: { to: string; icon: React.ElementType; key: TranslationKey }[] = [
  { to: '/chat', icon: MessageSquare, key: 'navChat' },
  { to: '/dashboard', icon: LayoutDashboard, key: 'navDashboard' },
  { to: '/tickets', icon: Ticket, key: 'navTickets' },
  { to: '/knowledge-base', icon: BookOpen, key: 'navKnowledgeBase' },
  { to: '/reports', icon: BarChart3, key: 'navReports' },
  { to: '/users', icon: Users, key: 'navUsers' },
  { to: '/settings', icon: Settings, key: 'navSettings' },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen, language, t } = useApp();
  const isRtl = language === 'ar';

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 ${isRtl ? 'right-0 border-l' : 'left-0 border-r'} h-full w-64 z-30 flex flex-col
          bg-white dark:bg-[#162032] text-slate-800 dark:text-white border-slate-200 dark:border-white/10 transition-colors duration-200
          lg:static lg:translate-x-0 lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Close button (mobile) */}
        <button
          className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'} p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 lg:hidden transition-colors`}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div className="px-6 py-7 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t('brandName')}
            </span>
            <Sparkles className="w-5 h-5 text-blue-500 fill-blue-500" />
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">
            {t('brandSubtitle')}
          </p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'active' : ''}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{t(key)}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className="px-3 pb-4 border-t border-slate-100 dark:border-white/10 pt-4 space-y-2">
          {/* Support shortcut */}
          <div className="bg-slate-50 dark:bg-[#1e2a42] border border-slate-200/80 dark:border-white/5 rounded-2xl p-4 text-center">
            <div className="flex justify-center mb-2">
              <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-600/20 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white mb-0.5">
              {t('navNeedHelp')}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              {t('navCreateDirectTicket')}
            </p>
            <NavLink
              to="/tickets/new"
              className="btn-primary w-full text-sm py-2"
              onClick={() => setSidebarOpen(false)}
            >
              <Plus className="w-4 h-4" />
              {t('navCreateTicket')}
            </NavLink>
          </div>
        </div>
      </aside>
    </>
  );
}
