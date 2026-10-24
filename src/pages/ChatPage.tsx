import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  Paperclip,
  Mic,
  Plus,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  Lock,
  User,
  ShieldCheck,
  Briefcase,
  Server,
  FileText,
  Lightbulb,
  Link as LinkIcon,
  Ticket as TicketIcon,
  Sparkles,
  CheckCircle,
  Key,
  History,
  Trash2,
  Clock,
  X,
  Search,
  MessageSquare,
  Database,
  ChevronRight,
  ChevronLeft,
  Info,
  SlidersHorizontal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MirAvatar, MirAvatarSmall } from '../components/ui/MirAvatar';
import { useApp } from '../context/AppContext';
import { chatService } from '../services/chatService';
import type { Message, TicketCreatedInfo, SuggestedAction, Conversation } from '../types/chat';
import type { Ticket as TicketType } from '../types/ticket';
import { ApiError, NetworkError } from '../services/apiClient';
import { PasswordResetModal } from '../components/modals/PasswordResetModal';
import { BookTicketModal } from '../components/modals/BookTicketModal';

// ─── Logos ────────────────────────────────────────────────────────────────────
function MicrosoftLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="1" y="1" width="9" height="9" fill="#f25022" />
      <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
      <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
      <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
    </svg>
  );
}

function WindowsLogo({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M3 5.5L10.5 4.5V11.5H3V5.5Z" fill="#0078D7" />
      <path d="M11.5 4.3L21 3V11.5H11.5V4.3Z" fill="#0078D7" />
      <path d="M3 12.5H10.5V19.5L3 18.5V12.5Z" fill="#0078D7" />
      <path d="M11.5 12.5H21V21L11.5 19.7V12.5Z" fill="#0078D7" />
    </svg>
  );
}

function generateId() {
  return Math.random().toString(36).slice(2, 11);
}

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  } catch {
    return '10:24 AM';
  }
}

function formatDateLabel(iso?: string, isAr = true) {
  if (!iso) return isAr ? 'حديثاً' : 'Recently';
  try {
    const d = new Date(iso);
    const now = new Date();
    const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
    if (diffHours < 24 && d.getDate() === now.getDate()) {
      return isAr ? 'اليوم' : 'Today';
    }
    if (diffHours < 48) {
      return isAr ? 'أمس' : 'Yesterday';
    }
    return d.toLocaleDateString(isAr ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric' });
  } catch {
    return isAr ? 'سابقاً' : 'Earlier';
  }
}

// ─── Markdown Inline Tokenizer & Formatter ────────────────────────────────────
function renderFormattedText(text: string): React.ReactNode {
  if (!text) return null;

  // Regex matches:
  // 1. Markdown link: [label](url)
  // 2. Bold: **content**
  // 3. Inline code: `code`
  // 4. Italic: *content*
  const tokenRegex = /(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  const nodes: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const fullMatch = match[0];
    if (fullMatch.startsWith('[')) {
      const label = match[2];
      const url = match[3];
      nodes.push(
        <a
          key={`link-${match.index}`}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1 mx-1 break-all"
        >
          <span>{label}</span>
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    } else if (fullMatch.startsWith('**')) {
      nodes.push(
        <strong key={`bold-${match.index}`} className="font-bold text-slate-900 dark:text-white">
          {match[4]}
        </strong>
      );
    } else if (fullMatch.startsWith('`')) {
      nodes.push(
        <code
          key={`code-${match.index}`}
          className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 font-mono text-[11px] text-blue-700 dark:text-blue-300 border border-slate-200 dark:border-slate-600 mx-0.5"
        >
          {match[5]}
        </code>
      );
    } else if (fullMatch.startsWith('*')) {
      nodes.push(
        <em key={`em-${match.index}`} className="italic text-slate-700 dark:text-slate-300">
          {match[6]}
        </em>
      );
    }

    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes.length > 0 ? nodes : text;
}

function FormattedMessageContent({
  content,
  isEn,
  onOpenGuide,
  onOpenNewTicket,
}: {
  content: string;
  isEn: boolean;
  onOpenGuide?: () => void;
  onOpenNewTicket?: () => void;
}) {
  const lower = content.toLowerCase();
  const hasPasswordOrLocked =
    lower.includes('account.live.com') ||
    lower.includes('password') ||
    lower.includes('مرور') ||
    lower.includes('باسورد') ||
    lower.includes('إعادة تعيين') ||
    lower.includes('قفل') ||
    lower.includes('مغلق') ||
    lower.includes('مقفل') ||
    lower.includes('locked') ||
    lower.includes('lockout') ||
    lower.includes('unlock') ||
    lower.includes('فك القفل') ||
    lower.includes('sspr');

  const hasTicketMention =
    lower.includes('تذكر') ||
    lower.includes('تذكره') ||
    lower.includes('ticket') ||
    lower.includes('انشاء تذكر') ||
    lower.includes('إنشاء تذكر') ||
    lower.includes('حجز') ||
    lower.includes('helpdesk') ||
    lower.includes('دعم فني') ||
    lower.includes('escalat');

  const hasSspr =
    lower.includes('aka.ms/sspr') ||
    lower.includes('sspr') ||
    lower.includes('مؤسس') ||
    lower.includes('عمل') ||
    lower.includes('school') ||
    lower.includes('work');

  const renderLine = (line: string, i: number) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('https://') || trimmed.startsWith('http://')) {
      return (
        <p key={i} className="my-1.5">
          <a
            href={trimmed}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 dark:text-blue-400 hover:underline font-semibold inline-flex items-center gap-1.5 break-all text-xs"
          >
            <span>{trimmed}</span>
            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
          </a>
        </p>
      );
    }

    if (trimmed.startsWith('#')) {
      return (
        <p key={i} className="font-bold text-slate-900 dark:text-white text-sm mt-3 mb-1">
          {renderFormattedText(trimmed.replace(/^#+\s*/, ''))}
        </p>
      );
    }

    if (
      trimmed.startsWith('📋') ||
      trimmed.startsWith('🔗') ||
      trimmed.startsWith('🎫') ||
      trimmed.startsWith('💡') ||
      trimmed.startsWith('⚠️')
    ) {
      return (
        <div key={i} className="font-semibold text-slate-800 dark:text-slate-100 mt-2.5 mb-1.5 flex items-start gap-1.5 leading-relaxed">
          <span>{renderFormattedText(line)}</span>
        </div>
      );
    }

    const stepMatch = trimmed.match(/^([1-9])[\.\-]\s*(.+)$/);
    if (stepMatch) {
      const stepNum = stepMatch[1];
      const stepText = stepMatch[2];
      return (
        <div
          key={i}
          className="my-2 p-3 rounded-xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200/90 dark:border-slate-700/80 text-xs flex items-start gap-3 text-start shadow-2xs"
        >
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center flex-shrink-0 mt-0.5 shadow-xs">
            {stepNum}
          </span>
          <div className="text-slate-800 dark:text-slate-200 leading-relaxed font-normal flex-1">
            {renderFormattedText(stepText)}
          </div>
        </div>
      );
    }

    const bulletMatch = trimmed.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch) {
      return (
        <div key={i} className="my-1.5 flex items-start gap-2.5 text-xs text-start px-1">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
          <div className="text-slate-800 dark:text-slate-200 leading-relaxed flex-1">
            {renderFormattedText(bulletMatch[1])}
          </div>
        </div>
      );
    }

    return (
      <p key={i} className={trimmed ? 'mb-1.5 last:mb-0 text-slate-800 dark:text-slate-200 leading-relaxed' : 'h-2'}>
        {renderFormattedText(line)}
      </p>
    );
  };

  return (
    <div>
      <div className="space-y-0.5">{content.split('\n').map(renderLine)}</div>

      {/* Action Button for Ticket Booking */}
      {hasTicketMention && onOpenNewTicket && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={onOpenNewTicket}
            className="w-full flex items-center justify-between gap-3 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors group cursor-pointer border border-emerald-500/20"
          >
            <div className="flex items-center gap-2.5">
              <TicketIcon className="w-4 h-4 text-emerald-100 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <span>
                {isEn
                  ? '🎫 Book & Register Support Ticket in System'
                  : '🎫 حجز وتأكيد تذكرة دعم فني الآن وتسجيلها في النظام'}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-emerald-100 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </button>
        </div>
      )}

      {/* Action Buttons for Password Reset & Locked Account */}
      {hasPasswordOrLocked && (
        <div className="mt-3.5 pt-3 border-t border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <a
            href="https://account.live.com/password/reset"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl font-semibold text-xs shadow-xs transition-colors group cursor-pointer border border-blue-500/20"
          >
            <div className="flex items-center gap-2.5">
              <Key className="w-4 h-4 text-blue-200 flex-shrink-0 group-hover:rotate-12 transition-transform" />
              <span>
                {isEn
                  ? '🔑 Reset Password & Unlock Account — Official Microsoft Page'
                  : '🔑 إعادة تعيين كلمة المرور وفك قفل الحساب (رابط رسمي)'}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </a>

          {hasSspr && (
            <a
              href="https://aka.ms/sspr"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-4 py-2.5 bg-slate-50 dark:bg-slate-700/70 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-semibold text-xs border border-slate-200 dark:border-slate-600 shadow-2xs transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Briefcase className="w-4 h-4 text-slate-500 dark:text-slate-300 flex-shrink-0" />
                <span>
                  {isEn
                    ? '🏢 Work / School SSPR Self-Service Portal (aka.ms/sspr)'
                    : '🏢 بوابة الخدمة الذاتية لحسابات العمل والمؤسسات (aka.ms/sspr)'}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
            </a>
          )}

          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-xl font-semibold text-xs border border-slate-300/80 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>
                {isEn
                  ? '📖 View Visual 5-Step Guide & Interactive Assistant'
                  : '📖 فتح نافذة دليل الخطوات المصور والمساعد التفاعلي'}
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function ChatPage() {
  const navigate = useNavigate();
  const { isDemo, language, t } = useApp();
  const isRtl = language === 'ar';

  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAccountTypes, setShowAccountTypes] = useState(false);
  const [suggestedActions, setSuggestedActions] = useState<SuggestedAction[]>([]);
  const [ticketInfo, setTicketInfo] = useState<TicketCreatedInfo | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);

  // ── States ──
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false); // Menu: Chat History Drawer
  const [showSupportPanel, setShowSupportPanel] = useState(true);     // Support & Info Panel (Open by default on the other side)
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [showBookTicketModal, setShowBookTicketModal] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isFirstRender = useRef(true);

  // Fetch conversations from MongoDB
  const fetchConversations = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const list = await chatService.getConversations();
      if (list && Array.isArray(list)) {
        setConversations(list);
      }
    } catch (err) {
      console.warn('Could not load conversations from DB:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  // Restore active chat from localStorage or load initial state
  useEffect(() => {
    fetchConversations();

    const savedId = localStorage.getItem('mir_active_conversation_id');
    if (savedId) {
      const loadSavedChat = async () => {
        setIsLoading(true);
        try {
          const msgs = await chatService.getMessages(savedId);
          if (msgs && msgs.length > 0) {
            setConversationId(savedId);
            setMessages(msgs);
            const conv = await chatService.getConversation(savedId);
            if (conv && (conv.ticketId || conv.ticket_id)) {
              const tid = conv.ticketId || conv.ticket_id;
              setTicketInfo({
                ticketNumber: `TCKT-${tid!.slice(0, 8).toUpperCase()}`,
                status: 'open',
                createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
                sapConfirmed: false,
              });
            }
          } else {
            localStorage.removeItem('mir_active_conversation_id');
          }
        } catch (err) {
          console.warn('Failed to restore active conversation:', err);
          localStorage.removeItem('mir_active_conversation_id');
        } finally {
          setIsLoading(false);
        }
      };
      loadSavedChat();
    }
  }, [fetchConversations]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setConversationId(undefined);
    setSuggestedActions([]);
    setShowAccountTypes(false);
    setError(null);
    setTicketInfo(null);
    localStorage.removeItem('mir_active_conversation_id');
    setShowHistoryDrawer(false);
  }, []);

  // Switch to a previous conversation from DB
  const selectConversation = async (conv: Conversation) => {
    setConversationId(conv.id);
    localStorage.setItem('mir_active_conversation_id', conv.id);
    setError(null);
    setShowAccountTypes(false);
    setSuggestedActions([]);
    setIsLoading(true);

    try {
      const msgs = await chatService.getMessages(conv.id);
      setMessages(msgs);

      if (conv.ticketId || conv.ticket_id) {
        const tid = conv.ticketId || conv.ticket_id;
        setTicketInfo({
          ticketNumber: `TCKT-${tid!.slice(0, 8).toUpperCase()}`,
          status: 'open',
          createdAt: conv.createdAt || conv.created_at || new Date().toISOString(),
          sapConfirmed: false,
        });
      } else {
        setTicketInfo(null);
      }
      setShowHistoryDrawer(false);
    } catch (err) {
      console.error('Failed to load conversation messages:', err);
      setError(
        isRtl
          ? 'تعذر تحميل رسائل هذه المحادثة من قاعدة البيانات.'
          : 'Failed to load conversation messages from database.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Delete conversation from MongoDB
  const deleteConversation = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm(isRtl ? 'هل تريد حذف هذه المحادثة من قاعدة البيانات؟' : 'Delete this chat from database?')) {
      return;
    }

    try {
      await chatService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        startNewChat();
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const addUserMessage = useCallback(
    (text: string): Message => {
      const msg: Message = {
        id: generateId(),
        conversationId: conversationId || 'new',
        role: 'user',
        content: text,
        timestamp: new Date().toISOString(),
        status: 'sending',
      };
      setMessages((prev) => [...prev, msg]);
      return msg;
    },
    [conversationId]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setError(null);
      setShowAccountTypes(false);
      setSuggestedActions([]);

      const userMsg = addUserMessage(text);
      setInput('');
      setIsLoading(true);

      setMessages((prev) =>
        prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'sent' } : m))
      );

      try {
        const res = await chatService.sendMessage({
          conversationId,
          message: text,
        });

        setConversationId(res.conversationId);
        localStorage.setItem('mir_active_conversation_id', res.conversationId);
        setMessages((prev) => [...prev, res.message]);

        if (res.suggestedActions && res.suggestedActions.length > 0) {
          setSuggestedActions(res.suggestedActions);
        }
        if (res.ticketCreated) {
          setTicketInfo(res.ticketCreated);
        }
        fetchConversations();
      } catch (err) {
        console.error('Chat error:', err);
        const errorMsg =
          err instanceof NetworkError
            ? isRtl
              ? 'تعذّر الاتصال بخادم MIR (FastAPI). يرجى التأكد من تشغيل الباك إند على المنفذ 8000.'
              : 'Unable to connect to MIR server (FastAPI). Please ensure backend is running on port 8000.'
            : err instanceof ApiError
            ? `خطأ: ${err.message}`
            : isRtl
            ? 'حدث خطأ أثناء معالجة الطلب مع Gemini.'
            : 'An error occurred while communicating with Gemini.';
        setError(errorMsg);
        setMessages((prev) =>
          prev.map((m) => (m.id === userMsg.id ? { ...m, status: 'error' } : m))
        );
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, isRtl, conversationId, addUserMessage, fetchConversations]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleTicketCreated = (ticket: TicketType) => {
    const num = ticket.ticketNumber || `TCKT-${ticket.id.slice(0, 8).toUpperCase()}`;
    setTicketInfo({
      ticketNumber: num,
      status: ticket.status || 'open',
      createdAt: ticket.createdAt || new Date().toISOString(),
      sapConfirmed: ticket.sapConfirmed || false,
    });

    const confMsg: Message = {
      id: generateId(),
      conversationId: conversationId || 'current',
      role: 'assistant',
      content: isRtl
        ? `🎫 **تم حجز التذكرة بنجاح وتسجيلها في قاعدة البيانات!**\n\n- **رقم التذكرة:** \`${num}\`\n- **الموضوع:** ${ticket.title || ticket.subject}\n- **الأولوية:** ${ticket.priority}\n- **الحالة:** ${ticket.status}\n\nيمكنك متابعة التذكرة وتفاصيلها عبر قسم التذاكر في أي وقت.`
        : `🎫 **Ticket successfully booked and stored in database!**\n\n- **Ticket Number:** \`${num}\`\n- **Title:** ${ticket.title || ticket.subject}\n- **Priority:** ${ticket.priority}\n- **Status:** ${ticket.status}\n\nYou can track this ticket anytime in the Tickets dashboard.`,
      timestamp: new Date().toISOString(),
      status: 'sent',
    };
    setMessages((prev) => [...prev, confMsg]);
    fetchConversations();
  };

  const filteredConversations = conversations.filter((c) =>
    (c.title || '').toLowerCase().includes(historySearch.toLowerCase())
  );

  return (
    <div
      className={`flex h-full w-full overflow-hidden bg-[#f8fafc] dark:bg-slate-950 relative ${
        isRtl ? 'font-cairo' : 'font-sans'
      }`}
    >
      {/* ── Main Chat Area (Full Width & Spacious) ── */}
      <div className="flex-1 flex flex-col h-full min-w-0 z-0">
        {/* Messages and header stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 lg:px-12 py-5 space-y-6">
          {/* Top Control Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80 dark:border-slate-800">
            <div className="flex items-center gap-4">
              <MirAvatar size={58} className="flex-shrink-0 shadow-sm" />
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-xl sm:text-2xl font-extrabold text-slate-800 dark:text-white tracking-tight">
                    MIR
                  </span>
                  <Sparkles className="w-4 h-4 text-blue-500 fill-blue-500" />
                  {conversationId && (
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono">
                      {conversationId.slice(0, 8)}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200">
                  {t('chatWelcome')}
                </p>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  {t('chatSubtitle')}
                </p>
              </div>
            </div>

            {/* Top Pop-Up Triggers Bar */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Trigger 1: Chat History Pop-up Menu */}
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(true)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                  showHistoryDrawer
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
                title={isRtl ? 'فتح منيو سجل المحادثات' : 'Open Chat History Menu'}
              >
                <History className={`w-4 h-4 ${showHistoryDrawer ? 'text-white' : 'text-blue-600 dark:text-blue-400'}`} />
                <span>{isRtl ? 'سجل المحادثات' : 'Chat History'}</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  showHistoryDrawer
                    ? 'bg-white text-blue-600'
                    : 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                }`}>
                  {conversations.length}
                </span>
              </button>

              {/* Trigger 2: Support Panel Toggle Button (مفتوحة عادي وتختفي بالزر) */}
              <button
                type="button"
                onClick={() => setShowSupportPanel(!showSupportPanel)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer shadow-xs ${
                  showSupportPanel
                    ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-300 dark:border-blue-800'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                }`}
                title={
                  showSupportPanel
                    ? isRtl ? 'إخفاء لوحة الدعم' : 'Hide Support Panel'
                    : isRtl ? 'إظهار لوحة الدعم' : 'Show Support Panel'
                }
              >
                <div className="relative">
                  <SlidersHorizontal className={`w-4 h-4 ${showSupportPanel ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`} />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5 animate-pulse" />
                </div>
                <span>{isRtl ? (showSupportPanel ? 'إخفاء لوحة الدعم' : 'لوحة الدعم') : (showSupportPanel ? 'Hide Support' : 'Support Panel')}</span>
              </button>

              {/* Trigger 3: Instant Book Ticket Modal */}
              <button
                type="button"
                onClick={() => setShowBookTicketModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs hover:shadow-md transition-all cursor-pointer"
                title={isRtl ? 'حجز تذكرة دعم فني جديدة' : 'Book a support ticket'}
              >
                <TicketIcon className="w-4 h-4 text-emerald-100" />
                <span>{isRtl ? 'حجز تذكرة دعم' : 'Book Ticket'}</span>
              </button>

              {/* Trigger 4: New Chat */}
              {messages.length > 0 && (
                <button
                  type="button"
                  onClick={startNewChat}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-xs transition-all cursor-pointer"
                  title={isRtl ? 'بدء محادثة جديدة' : 'Start new chat'}
                >
                  <Plus className="w-4 h-4 text-blue-500" />
                  <span>{isRtl ? 'محادثة جديدة' : 'New Chat'}</span>
                </button>
              )}
            </div>
          </div>

          {/* 4 Quick Action Cards (Spacious, beautifully laid out) */}
          {messages.length === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <button
                onClick={() => sendMessage(t('issuePassword'))}
                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-primary-400 hover:shadow-md cursor-pointer transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Lock className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                    {t('issuePassword')}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {t('issuePasswordSub')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => sendMessage(t('issueLocked'))}
                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-primary-400 hover:shadow-md cursor-pointer transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                    {t('issueLocked')}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {t('issueLockedSub')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => sendMessage(t('issueMfa'))}
                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-primary-400 hover:shadow-md cursor-pointer transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                    {t('issueMfa')}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {t('issueMfaSub')}
                  </p>
                </div>
              </button>

              <button
                onClick={() => sendMessage(t('issueWindows'))}
                className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-3.5 shadow-xs hover:border-primary-400 hover:shadow-md cursor-pointer transition-all text-start group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                  <WindowsLogo className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-primary-600 transition-colors truncate">
                    {t('issueWindows')}
                  </p>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {t('issueWindowsSub')}
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Messages Stream */}
          <div className="space-y-6 pt-2 max-w-4xl mx-auto w-full">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {msg.role === 'user' ? (
                  // User message (Clean, crisp, high contrast)
                  <div className="flex justify-end items-end gap-3">
                    <div className="max-w-2xl text-start" dir={isRtl ? 'rtl' : 'ltr'}>
                      <div className="bg-blue-600 dark:bg-blue-600 text-white rounded-2xl rounded-br-sm px-5 py-3 text-sm shadow-xs leading-relaxed inline-block font-normal">
                        {msg.content.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 text-end px-1 font-medium">
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white flex-shrink-0 shadow-xs mb-5">
                      <User className="w-5 h-5" />
                    </div>
                  </div>
                ) : (
                  // Assistant message (Clean white card with subtle border and crisp typography)
                  <div className="flex justify-start items-start gap-3">
                    <MirAvatarSmall size={36} className="mt-1 shadow-xs" />
                    <div className="max-w-2xl text-start flex-1" dir={isRtl ? 'rtl' : 'ltr'}>
                      <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 rounded-2xl rounded-tl-sm px-5 py-4 text-sm leading-relaxed shadow-xs inline-block w-full">
                        <FormattedMessageContent
                          content={msg.content}
                          isEn={language === 'en'}
                          onOpenGuide={() => setShowPasswordResetModal(true)}
                          onOpenNewTicket={() => setShowBookTicketModal(true)}
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 px-1 font-medium">
                        {formatTime(msg.timestamp)}
                      </p>

                      {/* Suggested Actions */}
                      {msg === messages[messages.length - 1] && suggestedActions.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2.5 mt-3">
                          {suggestedActions.map((action) => (
                            <button
                              key={action.id}
                              onClick={() => {
                                if (action.type === 'link' && action.url) {
                                  window.open(action.url, '_blank', 'noopener,noreferrer');
                                } else if (action.type === 'escalate') {
                                  setShowBookTicketModal(true);
                                } else {
                                  const prompt = isRtl ? (action.labelAr || action.label) : action.label;
                                  sendMessage(prompt);
                                }
                              }}
                              className="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-900/60 hover:border-blue-500 rounded-xl px-3.5 py-2 flex items-center gap-2 shadow-xs hover:shadow-sm cursor-pointer transition-all text-start group text-xs font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
                            >
                              <Sparkles className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span>{isRtl ? (action.labelAr || action.label) : action.label}</span>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* 3 Choice Buttons */}
                      {showAccountTypes && msg === messages[messages.length - 1] && (
                        <div className="flex flex-wrap items-center gap-3 mt-3">
                          <button
                            onClick={() => sendMessage(t('choicePersonal'))}
                            className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs hover:border-primary-500 hover:shadow-sm cursor-pointer transition-all text-start group"
                          >
                            <MicrosoftLogo className="w-4 h-4 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary-600">
                                {t('choicePersonal')}
                              </p>
                              <p className="text-[10px] text-slate-400">{t('choicePersonalSub')}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => sendMessage(t('choiceWork'))}
                            className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs hover:border-primary-500 hover:shadow-sm cursor-pointer transition-all text-start group"
                          >
                            <Briefcase className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary-600">
                                {t('choiceWork')}
                              </p>
                              <p className="text-[10px] text-slate-400">{t('choiceWorkSub')}</p>
                            </div>
                          </button>

                          <button
                            onClick={() => sendMessage(t('choiceDomain'))}
                            className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 shadow-xs hover:border-primary-500 hover:shadow-sm cursor-pointer transition-all text-start group"
                          >
                            <Server className="w-4 h-4 text-blue-600 flex-shrink-0" />
                            <div>
                              <p className="font-bold text-xs text-slate-800 dark:text-slate-100 group-hover:text-primary-600">
                                {t('choiceDomain')}
                              </p>
                              <p className="text-[10px] text-slate-400">{t('choiceDomainSub')}</p>
                            </div>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-center gap-3">
                <MirAvatarSmall size={36} />
                <div className="bg-[#f1f5f9] dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-xs">
                  <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  />
                  <span
                    className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  />
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-center justify-between p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  onClick={() => sendMessage(input || 'Retry')}
                  className="flex items-center gap-1 text-red-600 font-bold hover:underline cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isRtl ? 'إعادة' : 'Retry'}
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* ── Bottom Chat Input Bar ── */}
        <div className="px-4 sm:px-8 lg:px-12 pb-6 pt-2 flex-shrink-0 max-w-4xl mx-auto w-full">
          <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl px-4 py-2.5 flex items-center gap-3 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-all">
            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={t('attachFile')}
              title={t('attachFile')}
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('inputPlaceholder')}
              dir={isRtl ? 'rtl' : 'ltr'}
              disabled={isLoading}
              className={`flex-1 bg-transparent border-0 outline-none text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 px-2 ${
                isRtl ? 'text-right' : 'text-left'
              }`}
            />

            <button
              type="button"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={t('voiceInput')}
              title={t('voiceInput')}
            >
              <Mic className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-10 h-10 rounded-full bg-[#2563eb] hover:bg-[#1d4ed8] text-white flex items-center justify-center transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              aria-label={t('send')}
              title={t('send')}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── POP-UP MENU 1: Chat History Drawer (سجل المحادثات من MongoDB) ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {showHistoryDrawer && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 transition-opacity animate-in fade-in duration-200"
          onClick={() => setShowHistoryDrawer(false)}
        />
      )}

      <aside
        className={`
          fixed top-0 bottom-0 ${isRtl ? 'right-0' : 'left-0'} z-50
          w-80 sm:w-96 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800
          ${isRtl ? 'border-l' : 'border-r'} flex flex-col shadow-2xl transition-transform duration-300 ease-in-out
          ${showHistoryDrawer ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}
        `}
      >
        {/* History Menu Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span>{isRtl ? 'سجل المحادثات' : 'Chat History'}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold">
                  {conversations.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400 font-medium">
                {isRtl ? 'محفوظة في قاعدة بيانات MongoDB' : 'Saved in MongoDB database'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={startNewChat}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/40 rounded-xl font-bold transition-colors cursor-pointer"
              title={isRtl ? 'محادثة جديدة' : 'New Chat'}
            >
              <Plus className="w-4 h-4" />
              <span>{isRtl ? 'جديد' : 'New'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowHistoryDrawer(false)}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-slate-100 dark:border-slate-800/60">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
            <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
            <input
              type="text"
              value={historySearch}
              onChange={(e) => setHistorySearch(e.target.value)}
              placeholder={isRtl ? 'بحث في المحادثات السابقة...' : 'Search chat history...'}
              className="w-full bg-transparent border-0 outline-none text-xs placeholder-slate-400"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          {isLoadingHistory ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-blue-500" />
              <span>{isRtl ? 'جاري استرجاع المحادثات من MongoDB...' : 'Loading chats from database...'}</span>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="py-16 px-4 text-center space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                {isRtl ? 'لا توجد محادثات سابقة مسجلة' : 'No previous chats saved'}
              </p>
              <button
                type="button"
                onClick={startNewChat}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs text-blue-600 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-xl font-bold cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{isRtl ? 'بدء محادثة جديدة' : 'Start new chat'}</span>
              </button>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === conversationId;
              const hasTicket = Boolean(conv.ticketId || conv.ticket_id);
              return (
                <div
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`group relative p-3 rounded-2xl cursor-pointer transition-all flex items-start justify-between gap-2 text-start ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900/70 shadow-xs'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-xs font-bold leading-snug truncate ${
                        isActive
                          ? 'text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-200 group-hover:text-blue-600'
                      }`}
                    >
                      {conv.title || (isRtl ? 'محادثة بدون عنوان' : 'Untitled Chat')}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateLabel(conv.updatedAt || conv.updated_at || conv.createdAt || conv.created_at, isRtl)}
                      </span>
                      {hasTicket && (
                        <span className="px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 font-bold text-[9px] flex items-center gap-1">
                          <TicketIcon className="w-2.5 h-2.5" />
                          {isRtl ? 'تذكرة مسجلة' : 'Ticket'}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => deleteConversation(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-all"
                    title={isRtl ? 'حذف من الداتابيز' : 'Delete from DB'}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* History Menu Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 text-center bg-slate-50/50 dark:bg-slate-900/50">
          <p className="text-[11px] text-slate-400 font-medium">
            {isRtl ? 'يمكنك الرجوع لأي محادثة ومتابعتها في أي وقت' : 'You can revisit any chat anytime'}
          </p>
        </div>
      </aside>

      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {/* ── Support & Tickets Panel (مفتوحة عادي على الناحية التانية وتختفي بالزر) ── */}
      {/* ═════════════════════════════════════════════════════════════════════════ */}
      {showSupportPanel && (
        <>
          {/* Mobile Overlay (Only on small screens) */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs z-30 lg:hidden"
            onClick={() => setShowSupportPanel(false)}
          />

          <aside
            className={`
              fixed lg:static top-0 bottom-0 ${isRtl ? 'left-0' : 'right-0'} z-30 lg:z-10
              w-80 flex-shrink-0 bg-white dark:bg-slate-900 ${isRtl ? 'border-r' : 'border-l'} border-slate-200/90 dark:border-slate-800
              flex flex-col h-full overflow-y-auto transition-all duration-300 shadow-xl lg:shadow-none animate-in fade-in
            `}
          >
            {/* Panel Header */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                  {isRtl ? 'لوحة الدعم والتذاكر' : 'Support & Tickets'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSupportPanel(false)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                title={isRtl ? 'إخفاء لوحة الدعم' : 'Hide panel'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* 1. System Status */}
              <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    {t('systemStatus')}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    {t('connected')}
                  </span>
                </div>
              </div>

              {/* 2. Current Ticket (Booked / Open) */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs text-center">
                <div className="flex items-center gap-2 mb-3">
                  <TicketIcon className="w-4 h-4 text-slate-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {t('currentTicket')}
                  </span>
                </div>

                {ticketInfo ? (
                  <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-start space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold mb-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>{isRtl ? 'تم تسجيل التذكرة في قاعدة البيانات' : 'Ticket Recorded in Database'}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">
                      {t('ticketNumber')}:{' '}
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">
                        {ticketInfo.ticketNumber}
                      </span>
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('/tickets')}
                      className="mt-2 w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <span>{isRtl ? 'عرض في صفحة التذاكر' : 'View in Tickets'}</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="py-2">
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mb-3">{t('noOpenTicket')}</p>
                    <button
                      type="button"
                      onClick={() => setShowBookTicketModal(true)}
                      className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-2.5 rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      {isRtl ? 'حجز تذكرة دعم فني جديدة' : 'Book Support Ticket'}
                    </button>
                  </div>
                )}
              </div>

              {/* 3. Quick Links */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                  <LinkIcon className="w-4 h-4 text-slate-500" />
                  {t('quickLinks')}
                </h3>
                <div className="space-y-2">
                  <a
                    href="https://account.live.com/password/reset"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {t('linkPasswordReset')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('linkPasswordResetSub')}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </a>

                  <a
                    href="https://aka.ms/mysecurityinfo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {t('linkSecurityInfo')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('linkSecurityInfoSub')}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </a>

                  <a
                    href="https://support.microsoft.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group text-start"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-700/60 flex items-center justify-center flex-shrink-0">
                        <MicrosoftLogo className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-600 transition-colors">
                          {t('linkHelpCenter')}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">{t('linkHelpCenterSub')}</p>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 flex-shrink-0" />
                  </a>
                </div>
              </div>

              {/* 4. Suggested Articles */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-800 dark:text-white">
                    {t('suggestedArticles')}
                  </span>
                </div>
                <div className="space-y-1.5">
                  {[
                    t('articlePassword'),
                    t('articleLocked'),
                    t('articleMfa'),
                  ].map((article) => (
                    <button
                      key={article}
                      onClick={() => sendMessage(article)}
                      className="w-full flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700/50 text-start transition-colors group cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-700 dark:text-slate-200 group-hover:text-blue-600 font-medium leading-snug">
                        {article}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </>
      )}

      {/* Password Reset Visual Guide & Link Modal */}
      <PasswordResetModal
        isOpen={showPasswordResetModal}
        onClose={() => setShowPasswordResetModal(false)}
        onSendToChat={() => sendMessage(t('issuePassword'))}
      />

      {/* Direct Ticket Booking Modal */}
      <BookTicketModal
        isOpen={showBookTicketModal}
        onClose={() => setShowBookTicketModal(false)}
        conversationId={conversationId}
        defaultTitle={
          messages.length > 0 && messages[messages.length - 1].role === 'user'
            ? messages[messages.length - 1].content.slice(0, 60)
            : isRtl
            ? 'طلب دعم فني لحل المشكلة'
            : 'Technical Support Request'
        }
        defaultDescription={
          messages.length > 0
            ? messages
                .slice(-4)
                .map((m) => `${m.role === 'user' ? 'المستخدم' : 'MIR'}: ${m.content}`)
                .join('\n\n')
            : ''
        }
        onTicketCreated={handleTicketCreated}
      />
    </div>
  );
}
