import React, { useState, useEffect } from 'react';
import {
  X,
  Ticket,
  AlertCircle,
  CheckCircle,
  Loader2,
  ShieldAlert,
  Server,
  Lock,
  FileText,
} from 'lucide-react';
import { ticketService } from '../../services/ticketService';
import { useApp } from '../../context/AppContext';
import type { Ticket as TicketType, TicketPriority } from '../../types/ticket';

interface BookTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId?: string;
  defaultTitle?: string;
  defaultDescription?: string;
  onTicketCreated: (ticket: TicketType) => void;
}

export function BookTicketModal({
  isOpen,
  onClose,
  conversationId,
  defaultTitle = '',
  defaultDescription = '',
  onTicketCreated,
}: BookTicketModalProps) {
  const { language } = useApp();
  const isAr = language === 'ar';

  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState(defaultDescription);
  const [category, setCategory] = useState('account');
  const [priority, setPriority] = useState<TicketPriority>('medium');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<TicketType | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle(defaultTitle || (isAr ? 'طلب دعم فني - مشكلة في الحساب' : 'Support Request - Account Issue'));
      setDescription(
        defaultDescription ||
          (isAr
            ? 'يرجى تقديم الدعم الفني لحل المشكلة المذكورة في المحادثة.'
            : 'Please assist in resolving the issue discussed in this chat conversation.')
      );
      setError(null);
      setSuccessTicket(null);
    }
  }, [isOpen, defaultTitle, defaultDescription, isAr]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError(isAr ? 'يرجى كتابة عنوان التذكرة' : 'Please provide a ticket title');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setError(isAr ? 'يرجى كتابة وصف المشكلة' : 'Please provide issue description');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const ticket = await ticketService.createTicket({
        title: title.trim(),
        subject: title.trim(),
        description: description.trim(),
        category,
        priority,
        conversationId,
        conversation_id: conversationId,
      });

      setSuccessTicket(ticket);
      onTicketCreated(ticket);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      console.error('Failed to create ticket:', err);
      const msg = err instanceof Error ? err.message : isAr ? 'فشل حجز التذكرة، يرجى المحاولة لاحقاً' : 'Failed to book ticket';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      dir={isAr ? 'rtl' : 'ltr'}
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                {isAr ? 'حجز تذكرة دعم فني جديدة' : 'Book Support Ticket'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'سيتم تسجيل التذكرة في قاعدة البيانات وربطها بالمحادثة الحالية'
                  : 'The ticket will be saved to MongoDB & linked to this chat'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {successTicket ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {isAr ? 'تم حجز التذكرة بنجاح!' : 'Ticket Booked Successfully!'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'رقم التذكرة المسجل في قاعدة البيانات:' : 'Registered Ticket Number in Database:'}
              </p>
              <div className="inline-block px-4 py-2 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl font-mono font-extrabold text-sm border border-blue-200 dark:border-blue-900">
                {successTicket.ticketNumber || `TCKT-${successTicket.id.slice(0, 8).toUpperCase()}`}
              </div>
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              {isAr ? 'جاري العودة للمحادثة...' : 'Returning to chat...'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-start">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 rounded-xl text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                {isAr ? 'عنوان المشكلة أو التذكرة' : 'Ticket Subject / Title'}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={isAr ? 'مثال: مشكلة قفل الحساب في مايكروسوفت' : 'e.g. Microsoft Account Locked'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                required
              />
            </div>

            {/* Category & Priority Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {isAr ? 'التصنيف / القسم' : 'Category'}
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="account">{isAr ? 'الحساب وتسجيل الدخول' : 'Account & Login'}</option>
                  <option value="password_reset">{isAr ? 'إعادة تعيين كلمة المرور' : 'Password Reset'}</option>
                  <option value="mfa">{isAr ? 'التحقق بخطوتين (MFA)' : 'MFA & Security'}</option>
                  <option value="windows">{isAr ? 'ويندوز والنظام' : 'Windows OS'}</option>
                  <option value="domain">{isAr ? 'Active Directory / النطاق' : 'Domain / AD'}</option>
                  <option value="general">{isAr ? 'دعم فني عام' : 'General Support'}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                  {isAr ? 'مستوى الأولوية' : 'Priority'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TicketPriority)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="low">{isAr ? 'منخفضة (Low)' : 'Low'}</option>
                  <option value="medium">{isAr ? 'متوسطة (Medium)' : 'Medium'}</option>
                  <option value="high">{isAr ? 'عالية (High)' : 'High'}</option>
                  <option value="critical">{isAr ? 'حرجة (Critical)' : 'Critical'}</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                {isAr ? 'تفاصيل المشكلة والملاحظات' : 'Detailed Description'}
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={isAr ? 'اشرح بالتفصيل المشكلة أو الإجراء المطلوب...' : 'Describe what happened...'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none"
                required
              />
            </div>

            {/* Linked Chat Info */}
            {conversationId && (
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-100 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400">
                <FileText className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                <span>
                  {isAr
                    ? `مرتبطة بالمحادثة: ${conversationId.slice(0, 8)}...`
                    : `Linked to conversation: ${conversationId.slice(0, 8)}...`}
                </span>
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{isAr ? 'جاري الحجز والتسجيل...' : 'Booking Ticket...'}</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-4 h-4" />
                    <span>{isAr ? 'تأكيد حجز التذكرة الآن' : 'Confirm & Book Ticket'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
