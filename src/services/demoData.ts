/**
 * Demo Data Provider
 * ──────────────────
 * Provides clearly labelled sample data for demo mode.
 * This data is NEVER used silently as a fallback after API failure.
 * Demo mode must be explicitly enabled via VITE_DEMO_MODE=true.
 */

import type { DashboardData } from '../types/dashboard';
import type { Ticket } from '../types/ticket';
import type { KBArticle } from '../types/knowledgeBase';
import type { Message, Conversation } from '../types/chat';

export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

// ─── Demo Conversations ───────────────────────────────────────────────────────

export const demoConversations: Conversation[] = [
  {
    id: 'demo-conv-1',
    title: 'مشكلة في كلمة المرور',
    status: 'active',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    messageCount: 6,
    category: 'password_reset',
  },
  {
    id: 'demo-conv-2',
    title: 'حساب مقفل في Active Directory',
    status: 'resolved',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    messageCount: 10,
    category: 'account_locked',
    ticketId: 'demo-ticket-1',
  },
];

export const demoInitialMessages: Message[] = [
  {
    id: 'demo-msg-1',
    conversationId: 'demo-conv-1',
    role: 'user',
    content: 'السلام عليكم\nالباسورد بتاعي مش شغال',
    timestamp: '2024-10-23T10:24:00.000Z',
    status: 'sent',
  },
  {
    id: 'demo-msg-2',
    conversationId: 'demo-conv-1',
    role: 'assistant',
    content:
      'وعليكم السلام!\nسأساعدك في حل مشكلة كلمة المرور.\n\nهل هذا حساب Microsoft شخصي، أم حساب العمل أو الدراسي الخاص بمؤسستك؟',
    timestamp: '2024-10-23T10:24:00.000Z',
    status: 'sent',
  },
];

// ─── Demo Tickets ─────────────────────────────────────────────────────────────

export const demoTickets: Ticket[] = [
  {
    id: 'demo-ticket-1',
    ticketNumber: 'MIR-2024-001',
    subject: 'Account Locked – Active Directory',
    subjectAr: 'حساب مقفل في Active Directory',
    description: 'المستخدم لا يستطيع تسجيل الدخول، الحساب مقفل بسبب محاولات متعددة فاشلة.',
    status: 'resolved',
    priority: 'high',
    category: 'account_locked',
    source: 'demo',
    sapConfirmed: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    customerReference: 'EMP-12345',
    conversationId: 'demo-conv-2',
    assignedAgent: 'أحمد محمد',
  },
  {
    id: 'demo-ticket-2',
    ticketNumber: 'MIR-2024-002',
    subject: 'MFA Setup Issues – Microsoft 365',
    subjectAr: 'مشكلة في إعداد المصادقة الثنائية',
    description: 'المستخدم لا يتلقى رمز التحقق على هاتفه المسجل.',
    status: 'open',
    priority: 'medium',
    category: 'mfa',
    source: 'demo',
    sapConfirmed: false,
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    customerReference: 'EMP-67890',
    assignedAgent: undefined,
  },
  {
    id: 'demo-ticket-3',
    ticketNumber: 'MIR-2024-003',
    subject: 'Windows Update Failure',
    subjectAr: 'فشل تحديث Windows',
    description: 'التحديث يفشل بخطأ 0x80070005.',
    status: 'in_progress',
    priority: 'low',
    category: 'windows',
    source: 'demo',
    sapConfirmed: false,
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    assignedAgent: 'سارة العمري',
  },
  {
    id: 'demo-ticket-4',
    ticketNumber: 'MIR-2024-004',
    subject: 'Password Reset – Personal Microsoft Account',
    subjectAr: 'إعادة تعيين كلمة المرور – حساب شخصي',
    description: 'المستخدم فقد الوصول لحساب Hotmail الشخصي.',
    status: 'escalated',
    priority: 'critical',
    category: 'password_reset',
    source: 'demo',
    sapConfirmed: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    customerReference: 'EMP-11111',
    assignedAgent: 'محمود السيد',
  },
];

// ─── Demo Dashboard ───────────────────────────────────────────────────────────

export const demoDashboardData: DashboardData = {
  stats: {
    totalConversations: 142,
    openTickets: 8,
    unresolvedConversations: 12,
    escalatedCases: 3,
    resolutionRate: 87.3,
    escalationRate: 8.5,
    avgResponseTime: 2.4,
  },
  recentConversations: [
    {
      id: 'demo-conv-1',
      title: 'مشكلة في كلمة المرور',
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      category: 'password_reset',
    },
    {
      id: 'demo-conv-2',
      title: 'حساب مقفل في Active Directory',
      status: 'resolved',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      category: 'account_locked',
    },
    {
      id: 'demo-conv-3',
      title: 'مشكلة في MFA',
      status: 'active',
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
      category: 'mfa',
    },
  ],
  recentTickets: demoTickets.slice(0, 4).map((t) => ({
    id: t.id,
    ticketNumber: t.ticketNumber,
    subject: t.subjectAr || t.subject,
    status: t.status,
    priority: t.priority,
    createdAt: t.createdAt,
    assignedAgent: t.assignedAgent,
  })),
};

// ─── Demo Knowledge Base ──────────────────────────────────────────────────────

export const demoKBArticles: KBArticle[] = [
  {
    id: 'kb-1',
    title: 'How to Reset Your Microsoft Account Password',
    titleAr: 'كيفية إعادة تعيين كلمة مرور حساب Microsoft',
    summary: 'Step-by-step guide to reset your Microsoft account password using account.live.com',
    summaryAr: 'دليل خطوة بخطوة لإعادة تعيين كلمة مرور حساب Microsoft',
    category: 'password_reset',
    accountTypes: ['personal'],
    sourceUrl: 'https://account.live.com/password/reset',
    isOfficial: true,
    tags: ['password', 'reset', 'microsoft', 'hotmail', 'outlook'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 1240,
  },
  {
    id: 'kb-2',
    title: 'Unlock Your Active Directory Account',
    titleAr: 'فتح حساب Active Directory المقفل',
    summary: 'How to request unlocking your domain account via IT helpdesk or self-service portal.',
    summaryAr: 'كيفية طلب فتح حساب النطاق عبر مكتب المساعدة أو البوابة الذاتية.',
    category: 'account_locked',
    accountTypes: ['domain'],
    sourceUrl: 'https://docs.microsoft.com/en-us/azure/active-directory/',
    isOfficial: true,
    tags: ['active directory', 'locked', 'domain', 'account'],
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    views: 876,
  },
  {
    id: 'kb-3',
    title: 'Setting Up Multi-Factor Authentication (MFA)',
    titleAr: 'إعداد المصادقة متعددة العوامل (MFA)',
    summary: 'Configure Microsoft Authenticator and other MFA methods for your account.',
    summaryAr: 'تكوين Microsoft Authenticator وطرق المصادقة الأخرى لحسابك.',
    category: 'mfa',
    accountTypes: ['work_school', 'personal'],
    sourceUrl: 'https://aka.ms/mfasetup',
    isOfficial: true,
    tags: ['mfa', 'authenticator', 'two-factor', 'security'],
    createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    views: 2100,
  },
  {
    id: 'kb-4',
    title: 'Fix Windows Update Errors',
    titleAr: 'إصلاح أخطاء Windows Update',
    summary: 'Common Windows Update errors and their solutions, including error codes.',
    summaryAr: 'أخطاء Windows Update الشائعة وحلولها، بما فيها رموز الأخطاء.',
    category: 'windows',
    accountTypes: ['all'],
    sourceUrl: 'https://support.microsoft.com/en-us/windows/windows-update',
    isOfficial: true,
    tags: ['windows', 'update', 'error', 'fix'],
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    views: 540,
  },
  {
    id: 'kb-5',
    title: 'Microsoft Entra ID – Identity Verification',
    titleAr: 'Microsoft Entra ID – التحقق من الهوية',
    summary: 'Verify your identity and manage sign-in security settings through Microsoft Entra.',
    summaryAr: 'تحقق من هويتك وإدارة إعدادات أمان تسجيل الدخول عبر Microsoft Entra.',
    category: 'active_directory',
    accountTypes: ['work_school', 'domain'],
    sourceUrl: 'https://aka.ms/mysecurityinfo',
    isOfficial: true,
    tags: ['entra', 'identity', 'verification', 'sign-in'],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    views: 680,
  },
];

// ─── Demo Reports Data ────────────────────────────────────────────────────────

export const demoReportsData = {
  conversationVolume: Array.from({ length: 14 }, (_, i) => ({
    date: new Date(Date.now() - (13 - i) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    count: Math.floor(Math.random() * 20) + 5,
  })),
  categoryDistribution: [
    { category: 'password_reset', categoryAr: 'إعادة كلمة المرور', count: 45 },
    { category: 'account_locked', categoryAr: 'حساب مقفل', count: 28 },
    { category: 'mfa', categoryAr: 'المصادقة الثنائية', count: 22 },
    { category: 'windows', categoryAr: 'Windows', count: 18 },
    { category: 'active_directory', categoryAr: 'Active Directory', count: 15 },
    { category: 'network', categoryAr: 'الشبكة', count: 8 },
    { category: 'microsoft_365', categoryAr: 'Microsoft 365', count: 6 },
  ],
  ticketStatusDistribution: [
    { status: 'open', statusAr: 'مفتوح', count: 8, color: '#3b82f6' },
    { status: 'in_progress', statusAr: 'قيد المعالجة', count: 5, color: '#f59e0b' },
    { status: 'resolved', statusAr: 'محلول', count: 124, color: '#10b981' },
    { status: 'escalated', statusAr: 'مُصعَّد', count: 3, color: '#ef4444' },
    { status: 'closed', statusAr: 'مغلق', count: 2, color: '#6b7280' },
  ],
  resolutionRate: 87.3,
  escalationRate: 8.5,
};
