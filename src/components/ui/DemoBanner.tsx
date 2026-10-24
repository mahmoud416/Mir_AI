import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface DemoBannerProps {
  className?: string;
}

export function DemoBanner({ className = '' }: DemoBannerProps) {
  const { language } = useApp();
  const isAr = language === 'ar';

  return (
    <div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-100 dark:bg-amber-950/80 border-2 border-amber-400 dark:border-amber-500 rounded-xl text-amber-900 dark:text-amber-200 text-xs font-extrabold shadow-sm ${className}`}
    >
      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse flex-shrink-0" />
      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
      <span>{isAr ? 'وضع تجريبي' : 'Demo Mode'}</span>
      <span className="hidden sm:inline text-amber-700/90 dark:text-amber-300/80 font-medium text-[11px]">
        {isAr ? '— البيانات المعروضة نموذجية' : '— Sample Data'}
      </span>
    </div>
  );
}
