import React, { useState } from 'react';
import {
  X,
  Key,
  ExternalLink,
  Copy,
  Check,
  Briefcase,
  ShieldCheck,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface PasswordResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendToChat?: () => void;
}

export function PasswordResetModal({ isOpen, onClose, onSendToChat }: PasswordResetModalProps) {
  const { language, t } = useApp();
  const isEn = language === 'en';
  const isRtl = language === 'ar';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const resetUrl = 'https://account.live.com/password/reset';
  const ssprUrl = 'https://aka.ms/sspr';

  const handleCopy = () => {
    navigator.clipboard.writeText(resetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps = [
    {
      num: 1,
      title: t('passwordStep1Title'),
      desc: t('passwordStep1Desc'),
      highlight: true,
    },
    {
      num: 2,
      title: t('passwordStep2Title'),
      desc: t('passwordStep2Desc'),
    },
    {
      num: 3,
      title: t('passwordStep3Title'),
      desc: t('passwordStep3Desc'),
    },
    {
      num: 4,
      title: t('passwordStep4Title'),
      desc: t('passwordStep4Desc'),
    },
    {
      num: 5,
      title: t('passwordStep5Title'),
      desc: t('passwordStep5Desc'),
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#162032] border border-slate-200 dark:border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative"
        dir={isRtl ? 'rtl' : 'ltr'}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 dark:bg-[#162032]/95 backdrop-blur-md px-6 py-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 shadow-inner">
              <Key className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {t('passwordModalTitle')}
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" />
                  {isEn ? 'Official' : 'رسمي وموثق'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {t('passwordModalSub')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center transition-colors"
            aria-label={t('closeModal')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Direct Link Action Cards */}
          <div className="space-y-2.5">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {isEn ? 'Direct Action Links (Click to open):' : 'الروابط المباشرة (اضغط للفتح مباشرة):'}
            </p>

            {/* Primary Action Button */}
            <a
              href={resetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl shadow-md hover:shadow-lg transition-all group border border-blue-400/30"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Key className="w-5 h-5 text-white" />
                </div>
                <div className="text-start">
                  <p className="text-sm font-bold leading-tight">
                    {t('passwordLinkPersonal')}
                  </p>
                  <p className="text-xs text-blue-100 mt-0.5 font-mono">
                    {resetUrl}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 text-xs font-bold flex-shrink-0 group-hover:bg-white/30 transition-all">
                <span>{isEn ? 'Open' : 'فتح'}</span>
                <ExternalLink className="w-4 h-4" />
              </div>
            </a>

            {/* SSPR Work Account Button */}
            <a
              href={ssprUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-2xl border border-slate-200 dark:border-slate-700 transition-all group text-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-200/80 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-bold leading-tight">
                    {t('passwordLinkWork')}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    {ssprUrl}
                  </p>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-primary-500 transition-colors flex-shrink-0" />
            </a>
          </div>

          {/* 5 Clear Steps */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {isEn ? '5-Step Recovery Guide:' : 'خطوات استرداد وتغيير كلمة المرور الخمس:'}
              </h3>
            </div>

            <div className="space-y-2.5">
              {steps.map((s) => (
                <div
                  key={s.num}
                  className={`p-3.5 rounded-2xl border text-start transition-all ${
                    s.highlight
                      ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200/80 dark:border-blue-900/50'
                      : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/70 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                        s.highlight
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {s.num}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100">
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {s.desc}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 dark:bg-slate-800/60 px-6 py-4 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {t('passwordCopied')}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>{t('passwordCopyLink')}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {onSendToChat && (
              <button
                onClick={() => {
                  onSendToChat();
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isEn ? 'Show in Chat' : 'عرض في المحادثة'}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#2563eb] hover:bg-[#1d4ed8] text-white transition-colors shadow-xs"
            >
              {t('closeModal')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
