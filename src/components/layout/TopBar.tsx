import React, { useState } from 'react';
import { Menu, Search, Bell, Sun, Moon, ChevronDown, AlertTriangle } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';

export function TopBar() {
  const { theme, toggleTheme, language, setSidebarOpen, t } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();

  const isDemoPage = ['/dashboard', '/tickets', '/knowledge-base', '/reports', '/users', '/settings'].some(
    (path) => location.pathname.startsWith(path)
  );

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-3 flex-1 max-w-md">
        {/* Mobile menu toggle */}
        <button
          className="btn-ghost lg:hidden p-2"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          id="mobile-menu-btn"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Search */}
        <div className="relative w-full">
          <Search className={`absolute ${language === 'ar' ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none`} />
          <input
            id="global-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            dir={language === 'ar' ? 'rtl' : 'ltr'}
            className={`w-full bg-[#f8fafc] dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700/80 rounded-xl ${
              language === 'ar' ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'
            } py-2 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-all duration-200`}
          />
        </div>
      </div>

      {/* Right side controls */}
      <div className="flex items-center gap-3">
        {/* Yellow Demo Mode Badge in Header */}
        {isDemoPage && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-500 rounded-xl text-amber-900 dark:text-amber-200 font-extrabold text-xs shadow-xs animate-in fade-in">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
            <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span>{language === 'ar' ? 'وضع تجريبي' : 'Demo Mode'}</span>
          </div>
        )}
        {/* Theme toggle */}
        <button
          id="theme-toggle"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
          title={theme === 'dark' ? t('toggleThemeLight') : t('toggleThemeDark')}
        >
          {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Notifications */}
        <button
          id="notifications-btn"
          className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
          aria-label={t('notifications')}
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            3
          </span>
        </button>

        {/* User profile */}
        <button
          id="user-profile-btn"
          className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          aria-label={t('profile')}
        >
          <div className="w-8 h-8 rounded-full bg-[#5b50e6] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            MM
          </div>
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:block">Mahmoud</span>
          <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
        </button>
      </div>
    </header>
  );
}
