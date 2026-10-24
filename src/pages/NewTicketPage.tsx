import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, ArrowRight, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { ticketService } from '../services/ticketService';
import type { TicketPriority, TicketCategory } from '../types/ticket';

export default function NewTicketPage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';
  const navigate = useNavigate();
  const location = useLocation();

  const state = (location.state as { subject?: string; description?: string; category?: TicketCategory }) || {};
  const [subject, setSubject] = useState(state.subject || '');
  const [description, setDescription] = useState(state.description || '');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [category, setCategory] = useState<TicketCategory>(state.category || 'other');
  const [customerRef, setCustomerRef] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [ticketNumber, setTicketNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoryOptions: { value: TicketCategory; label: string }[] = [
    { value: 'password_reset', label: t('catPasswordReset') },
    { value: 'account_locked', label: t('catAccountLocked') },
    { value: 'mfa', label: t('catMfa') },
    { value: 'windows', label: t('catWindows') },
    { value: 'active_directory', label: t('catActiveDirectory') },
    { value: 'network', label: t('catNetwork') },
    { value: 'microsoft_365', label: t('catM365') },
    { value: 'other', label: t('catOther') },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) return;
    setError(null);

    if (isDemo) {
      const num = `MIR-DEMO-${Math.floor(Math.random() * 9000) + 1000}`;
      setTicketNumber(num);
      setSubmitted(true);
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await ticketService.createTicket({
        subject: subject.trim(),
        description: description.trim(),
        priority,
        category,
        customerReference: customerRef || undefined,
      });
      setTicketNumber(created.ticketNumber || `TCKT-${created.id.slice(0, 8).toUpperCase()}`);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || (isEn ? 'Failed to create ticket' : 'تعذر إنشاء التذكرة'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <div className="card text-center py-10">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
            {isDemo
              ? isEn
                ? 'Demo Ticket Created'
                : 'تذكرة تجريبية — Demo'
              : isEn
              ? 'Ticket Created'
              : 'تم إنشاء التذكرة'}
          </h2>
          {isDemo && (
            <p className="text-amber-600 text-sm mb-2">
              {isEn
                ? '⚠️ This ticket is not submitted to SAP (Demo Mode only).'
                : '⚠️ لم تُرسَل هذه التذكرة إلى SAP. هذا وضع تجريبي فقط.'}
            </p>
          )}
          <p className="text-slate-500 text-sm mb-4">
            {t('ticketNumber')}:{' '}
            <span className="font-mono font-bold text-slate-800 dark:text-white">
              {ticketNumber}
            </span>
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/tickets')} className="btn-primary text-sm">
              {isEn ? 'View Tickets' : 'عرض التذاكر'}
            </button>
            <button
              onClick={() => {
                setSubmitted(false);
                setSubject('');
                setDescription('');
              }}
              className="btn-secondary text-sm"
            >
              {isEn ? 'New Ticket' : 'تذكرة أخرى'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const BackIcon = isEn ? ArrowLeft : ArrowRight;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/tickets" className="btn-ghost text-sm">
          <BackIcon className="w-4 h-4" />
          {t('navTickets')}
        </Link>
        <span className="text-slate-400">/</span>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
          {t('createNewTicket')}
        </h1>
        {isDemo && <DemoBanner />}
      </div>

      {isDemo && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl text-sm text-amber-700 dark:text-amber-300">
          {isEn
            ? '⚠️ In demo mode, tickets will not sync to SAP. It will be recorded as a demo ticket.'
            : '⚠️ في وضع Demo، لن تُرسَل هذه التذكرة إلى SAP. ستظهر كتذكرة تجريبية فقط.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <div>
          <label
            htmlFor="ticket-subject"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {isEn ? 'Ticket Subject' : 'موضوع التذكرة'} <span className="text-red-500">*</span>
          </label>
          <input
            id="ticket-subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder={
              isEn
                ? 'e.g., Cannot sign into corporate work account'
                : 'مثال: لا أستطيع تسجيل الدخول إلى حساب العمل'
            }
            className="input-field"
            required
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="ticket-category"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {t('category')} <span className="text-red-500">*</span>
            </label>
            <select
              id="ticket-category"
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="input-field"
              required
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="ticket-priority"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
            >
              {t('priority')}
            </label>
            <select
              id="ticket-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              className="input-field"
            >
              <option value="low">{t('priorityLow')}</option>
              <option value="medium">{t('priorityMedium')}</option>
              <option value="high">{t('priorityHigh')}</option>
              <option value="critical">{t('priorityCritical')}</option>
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="ticket-description"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {isEn ? 'Problem Description' : 'وصف المشكلة'} <span className="text-red-500">*</span>
          </label>
          <textarea
            id="ticket-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            placeholder={
              isEn
                ? 'Explain the issue in detail, describe any error messages or steps leading to it...'
                : 'اشرح المشكلة بالتفصيل، وضَّح الأخطاء التي تراها أو الخطوات التي أدت إلى المشكلة...'
            }
            className="input-field resize-y"
            required
          />
        </div>

        <div>
          <label
            htmlFor="ticket-customer-ref"
            className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1.5"
          >
            {isEn ? 'Customer Reference (Optional)' : 'مرجع العميل (اختياري)'}
          </label>
          <input
            id="ticket-customer-ref"
            type="text"
            value={customerRef}
            onChange={(e) => setCustomerRef(e.target.value)}
            placeholder="e.g. EMP-12345"
            className="input-field"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button type="submit" id="submit-ticket-btn" disabled={isSubmitting} className="btn-primary flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isEn ? 'Creating Ticket...' : 'جارٍ إنشاء التذكرة...'}</span>
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                <span>{t('createNewTicket')}</span>
              </>
            )}
          </button>
          <Link to="/tickets" className="btn-secondary">
            {t('cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
