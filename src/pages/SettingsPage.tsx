import React, { useState } from 'react';
import {
  Globe,
  Bell,
  Shield,
  Palette,
  Sun,
  Moon,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';

function SettingSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="card space-y-4">
      <div className="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary-600" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-white">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer">
        {label}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
          checked ? 'bg-primary-600' : 'bg-slate-200 dark:bg-slate-600'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme, language, setLanguage, isDemo, t } = useApp();
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifPush, setNotifPush] = useState(false);
  const [notifTicket, setNotifTicket] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('settingsTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t('settingsSubtitle')}</p>
        </div>
        {isDemo && <DemoBanner />}
      </div>

      {/* Appearance */}
      <SettingSection title={t('sectionAppearance')} icon={Palette}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">{t('themeMode')}</span>
          <div className="flex gap-2">
            <button
              id="theme-light-btn"
              onClick={() => theme === 'dark' && toggleTheme()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                theme === 'light'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Sun className="w-4 h-4" />
              {t('themeLight')}
            </button>
            <button
              id="theme-dark-btn"
              onClick={() => theme === 'light' && toggleTheme()}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                theme === 'dark'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <Moon className="w-4 h-4" />
              {t('themeDark')}
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Language */}
      <SettingSection title={t('sectionLanguage')} icon={Globe}>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-700 dark:text-slate-300">{t('uiLanguage')}</span>
          <div className="flex gap-2">
            <button
              id="lang-ar-btn"
              onClick={() => setLanguage('ar')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                language === 'ar'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {t('langArabic')}
            </button>
            <button
              id="lang-en-btn"
              onClick={() => setLanguage('en')}
              className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                language === 'en'
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {t('langEnglish')}
            </button>
          </div>
        </div>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title={t('sectionNotifications')} icon={Bell}>
        <div className="space-y-3">
          <Toggle
            id="notif-email"
            checked={notifEmail}
            onChange={setNotifEmail}
            label={t('notifEmail')}
          />
          <Toggle
            id="notif-push"
            checked={notifPush}
            onChange={setNotifPush}
            label={t('notifPush')}
          />
          <Toggle
            id="notif-ticket"
            checked={notifTicket}
            onChange={setNotifTicket}
            label={t('notifTickets')}
          />
        </div>
      </SettingSection>

      {/* Security */}
      <SettingSection title={t('sectionSecurity')} icon={Shield}>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl flex items-center gap-2 text-green-700 dark:text-green-300 text-sm">
            <Check className="w-4 h-4 flex-shrink-0" />
            {t('securityNotice')}
          </div>
        </div>
      </SettingSection>

      {/* Save Button */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          className="btn-primary"
        >
          {t('saveChanges')}
        </button>
        {saved && (
          <span className="text-sm text-green-600 dark:text-green-400 font-medium animate-fade-in">
            {t('savedSuccess')}
          </span>
        )}
      </div>
    </div>
  );
}
