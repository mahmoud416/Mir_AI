import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { isDemoMode } from '../services/demoData';
import { translations, type Language, type TranslationKey } from '../i18n/translations';

interface AppContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
  isDemo: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem('mir_theme');
    return (stored as 'light' | 'dark') || 'light';
  });

  const [language, setLanguageState] = useState<Language>(() => {
    const stored = localStorage.getItem('mir_language');
    return (stored as Language) || 'ar';
  });

  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('mir_theme', theme);
  }, [theme]);

  useEffect(() => {
    const isAr = language === 'ar';
    document.documentElement.lang = language;
    document.documentElement.dir = isAr ? 'rtl' : 'ltr';
    document.body.dir = isAr ? 'rtl' : 'ltr';
    localStorage.setItem('mir_language', language);
  }, [language]);

  const toggleTheme = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'));

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = useCallback(
    (key: TranslationKey): string => {
      const dict = translations[language] || translations.ar;
      return dict[key] || translations.ar[key] || key;
    },
    [language]
  );

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        language,
        setLanguage,
        t,
        isDemo: isDemoMode,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
