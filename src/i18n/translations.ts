export type Language = 'ar' | 'en';

export const translations = {
  ar: {
    // Brand
    brandName: 'MIR',
    brandSubtitle: 'مساعد دعم تقنية المعلومات',

    // Nav
    navChat: 'المحادثة',
    navDashboard: 'لوحة التحكم',
    navTickets: 'التذاكر',
    navKnowledgeBase: 'قاعدة المعرفة',
    navReports: 'التقارير',
    navUsers: 'المستخدمون',
    navSettings: 'الإعدادات',
    navNeedHelp: 'تحتاج مساعدة فورية؟',
    navCreateDirectTicket: 'يمكنك إنشاء تذكرة مباشرة',
    navCreateTicket: 'إنشاء تذكرة',

    // TopBar
    searchPlaceholder: 'ابحث في قاعدة المعرفة ...',
    notifications: 'الإشعارات',
    profile: 'الملف الشخصي',
    toggleThemeLight: 'التبديل إلى الوضع الفاتح',
    toggleThemeDark: 'التبديل إلى الوضع الداكن',

    // Chat Page
    chatWelcome: 'مرحباً! 👋',
    chatSubtitle: 'أنا MIR، مساعدك الذكي لحل مشاكل Microsoft و IT',
    
    // Quick Issue Cards
    issuePassword: 'نسيت كلمة المرور',
    issuePasswordSub: 'حساب Microsoft أو العمل',
    issueLocked: 'الحساب مقفل',
    issueLockedSub: 'لا أستطيع تسجيل الدخول',
    issueMfa: 'مشكلة في MFA',
    issueMfaSub: 'لا أستطيع التحقق',
    issueWindows: 'مشكلة في Windows',
    issueWindowsSub: 'أخطاء أو تحديثات',

    // Demo Initial Messages
    userMsgInitial: 'السلام عليكم\nالباسورد بتاعي مش شغال',
    botMsgInitial: 'وعليكم السلام!\nسأساعدك في حل مشكلة كلمة المرور.\n\nهل هذا حساب Microsoft شخصي، أم حساب العمل أو الدراسي الخاص بمؤسستك؟',

    // Choice Cards
    choicePersonal: 'حساب Microsoft شخصي',
    choicePersonalSub: 'مثل Outlook أو Hotmail',
    choiceWork: 'حساب العمل أو الدراسة',
    choiceWorkSub: 'Microsoft 365 / Entra ID',
    choiceDomain: 'حساب Domain',
    choiceDomainSub: 'Active Directory',

    // Input Bar
    inputPlaceholder: 'اكتب رسالتك هنا ...',
    attachFile: 'إرفاق ملف',
    voiceInput: 'إدخال صوتي',
    send: 'إرسال',

    // Right Widgets
    systemStatus: 'حالة النظام',
    connected: 'مُتصل',
    quickLinks: 'روابط سريعة',
    linkPasswordReset: 'إعادة تعيين كلمة المرور',
    linkPasswordResetSub: 'الرابط المباشر والخطوات الخمس',
    linkSecurityInfo: 'صفحة التحقق من الهوية',
    linkSecurityInfoSub: 'Microsoft Entra',
    linkHelpCenter: 'مركز مساعدة Microsoft',
    linkHelpCenterSub: 'كل المقالات الرسمية',
    currentTicket: 'تذكرة حالية',
    noOpenTicket: 'لا توجد تذكرة مفتوحة حالياً',
    createNewTicket: 'إنشاء تذكرة جديدة',
    ticketConfirmed: 'تم تأكيد التذكرة (SAP)',
    ticketNumber: 'رقم التذكرة',
    suggestedArticles: 'مقالات مقترحة',
    articlePassword: 'خطوات إعادة تعيين كلمة مرور Microsoft',
    articleLocked: 'حل مشكلة الحساب المغلق',
    articleMfa: 'مشاكل المصادقة المتعددة (MFA)',
    chatHistory: 'سجل المحادثات',
    bookTicket: 'حجز تذكرة دعم فني',
    newChat: 'محادثة جديدة',
    noConversations: 'لا توجد محادثات سابقة مسجلة',
    deleteChat: 'حذف المحادثة',
    confirmDeleteChat: 'هل أنت متأكد من حذف هذه المحادثة من قاعدة البيانات؟',
    ticketBookedSuccess: 'تم حجز التذكرة بنجاح وتسجيلها في قاعدة البيانات',

    // Password Reset Modal & Guide
    passwordModalTitle: 'دليل وروابط إعادة تعيين كلمة المرور',
    passwordModalSub: 'الروابط المباشرة المعتمدة والخطوات الخمس التفصيلية لاسترداد حسابك',
    passwordLinkPersonal: 'فتح صفحة استرداد كلمة المرور الرسمية (Microsoft)',
    passwordLinkWork: 'بوابة الخدمة الذاتية لحسابات العمل والمؤسسات (SSPR)',
    passwordCopyLink: 'نسخ الرابط',
    passwordCopied: 'تم النسخ!',
    passwordStep1Title: '1. الدخول للبوابة الرسمية',
    passwordStep1Desc: 'اضغط على الرابط أعلاه لفتح صفحة استرداد كلمة مرور حساب Microsoft الرسمية والآمنة.',
    passwordStep2Title: '2. إدخال البريد الإلكتروني أو الهاتف',
    passwordStep2Desc: 'اكتب بريدك الإلكتروني (Outlook / Hotmail أو بريد العمل) أو رقم الهاتف المسجل واضغط "التالي".',
    passwordStep3Title: '3. تحديد وسيلة التحقق من الهوية',
    passwordStep3Desc: 'اختر طريقة استلام رمز الأمان: رسالة نصية قصيرة SMS، أو بريد إلكتروني بديل، أو تطبيق Microsoft Authenticator.',
    passwordStep4Title: '4. إدخال رمز الأمان المستلم',
    passwordStep4Desc: 'اكتب رمز التحقق المكون من 6 أرقام لتأكيد ملكيتك للحساب والمتابعة.',
    passwordStep5Title: '5. إنشاء وتأكيد كلمة المرور الجديدة',
    passwordStep5Desc: 'عيّن كلمة مرور قوية جديدة (8 خانات على الأقل تجمع أحرفاً وأرقاماً ورموزاً) ثم احفظها وسجّل الدخول.',
    viewFullGuide: 'عرض دليل الخطوات التفصيلي',
    closeModal: 'إغلاق',

    // Common
    viewAll: 'عرض الكل',
    search: 'بحث',
    all: 'الكل',
    status: 'الحالة',
    priority: 'الأولوية',
    category: 'التصنيف',
    actions: 'الإجراءات',
    save: 'حفظ',
    cancel: 'إلغاء',
    submit: 'إرسال',
    back: 'رجوع',

    // Dashboard
    dashTitle: 'لوحة التحكم',
    dashSubtitle: 'نظرة عامة على أداء نظام الدعم الفني وتذاكر المساعدة',
    statTotalConversations: 'إجمالي المحادثات',
    statOpenTickets: 'تذاكر مفتوحة',
    statResolvedTickets: 'تذاكر تم حلها',
    statCriticalTickets: 'تذاكر حرجة',
    dashRecentTickets: 'أحدث التذاكر',
    dashQuickActions: 'إجراءات سريعة',
    dashSystemOverview: 'نظرة عامة على النظام',
    dashResolutionRate: 'نسبة الإنجاز',
    dashAvgResponseTime: 'متوسط سرعة الاستجابة',

    // Tickets Page
    ticketsTitle: 'التذاكر',
    ticketsSubtitle: 'إدارة وتتبع طلبات الدعم الفني وتكامل SAP',
    searchTicketsPlaceholder: 'ابحث برقم التذكرة أو العنوان...',
    colTicketNumber: 'رقم التذكرة',
    colSubject: 'الموضوع',
    colCategory: 'التصنيف',
    colStatus: 'الحالة',
    colPriority: 'الأولوية',
    colDate: 'التاريخ',

    // Statuses
    statusOpen: 'مفتوح',
    statusInProgress: 'قيد المعالجة',
    statusResolved: 'تم الحل',
    statusClosed: 'مغلق',
    statusEscalated: 'مُصعَّد',

    // Priorities
    priorityLow: 'منخفض',
    priorityMedium: 'متوسط',
    priorityHigh: 'عالي',
    priorityCritical: 'حرج',

    // Categories
    catPasswordReset: 'إعادة كلمة المرور',
    catAccountLocked: 'حساب مقفل',
    catMfa: 'المصادقة الثنائية (MFA)',
    catWindows: 'Windows',
    catActiveDirectory: 'Active Directory',
    catNetwork: 'الشبكة',
    catM365: 'Microsoft 365',
    catOther: 'أخرى',

    // Knowledge Base
    kbTitle: 'قاعدة المعرفة',
    kbSubtitle: 'أدلة إرشادية وحلول للمشاكل التقنية الشائعة',
    searchKbPlaceholder: 'ابحث في المقالات والحلول...',
    kbPopularArticles: 'المقالات الشائعة',
    kbReadTime: 'دقيقة قراءة',
    kbViews: 'مشاهدة',

    // Reports
    reportsTitle: 'التقارير والإحصائيات',
    reportsSubtitle: 'تحليلات تفصيلية لحجم التذاكر والأداء',
    reportVolume: 'حجم التذاكر',
    reportDistribution: 'توزيع التصنيفات',
    reportResolution: 'معدل الحل',

    // Users
    usersTitle: 'إدارة المستخدمين',
    usersSubtitle: 'فريق الدعم الفني وصلاحيات المستخدمين',
    userColName: 'الاسم',
    userColEmail: 'البريد الإلكتروني',
    userColRole: 'الدور',
    userColStatus: 'حالة الحساب',
    roleAdmin: 'مدير النظام',
    roleAgent: 'أخصائي دعم',
    roleUser: 'مستخدم',

    // Settings
    settingsTitle: 'الإعدادات',
    settingsSubtitle: 'تخصيص تجربتك مع MIR',
    sectionAppearance: 'المظهر',
    themeMode: 'وضع العرض',
    themeLight: 'فاتح',
    themeDark: 'داكن',
    sectionLanguage: 'اللغة والمنطقة',
    uiLanguage: 'لغة الواجهة',
    langArabic: 'العربية',
    langEnglish: 'English',
    sectionNotifications: 'الإشعارات',
    notifEmail: 'إشعارات البريد الإلكتروني',
    notifPush: 'الإشعارات الفورية',
    notifTickets: 'تحديثات التذاكر',
    sectionSecurity: 'الأمان',
    securityNotice: 'المصادقة مُدارة بالكامل من الخادم. لا تُطبَّق صلاحيات الأمان في الواجهة الأمامية.',
    saveChanges: 'حفظ الإعدادات',
    savedSuccess: 'تم حفظ الإعدادات بنجاح!',
  },

  en: {
    // Brand
    brandName: 'MIR',
    brandSubtitle: 'IT Support Assistant',

    // Nav
    navChat: 'Chat',
    navDashboard: 'Dashboard',
    navTickets: 'Tickets',
    navKnowledgeBase: 'Knowledge Base',
    navReports: 'Reports',
    navUsers: 'Users',
    navSettings: 'Settings',
    navNeedHelp: 'Need immediate help?',
    navCreateDirectTicket: 'You can create a ticket directly',
    navCreateTicket: 'Create Ticket',

    // TopBar
    searchPlaceholder: 'Search knowledge base ...',
    notifications: 'Notifications',
    profile: 'Profile',
    toggleThemeLight: 'Switch to light mode',
    toggleThemeDark: 'Switch to dark mode',

    // Chat Page
    chatWelcome: 'Hello! 👋',
    chatSubtitle: 'I am MIR, your intelligent IT & Microsoft assistant',
    
    // Quick Issue Cards
    issuePassword: 'Forgot Password',
    issuePasswordSub: 'Microsoft or work account',
    issueLocked: 'Account Locked',
    issueLockedSub: 'Cannot sign in',
    issueMfa: 'MFA Issue',
    issueMfaSub: 'Cannot verify',
    issueWindows: 'Windows Issue',
    issueWindowsSub: 'Errors or updates',

    // Demo Initial Messages
    userMsgInitial: 'Hello,\nMy password is not working',
    botMsgInitial: 'Hello!\nI will help you resolve your password issue.\n\nIs this a personal Microsoft account, or your work/school organization account?',

    // Choice Cards
    choicePersonal: 'Personal Microsoft Account',
    choicePersonalSub: 'e.g. Outlook or Hotmail',
    choiceWork: 'Work or School Account',
    choiceWorkSub: 'Microsoft 365 / Entra ID',
    choiceDomain: 'Domain Account',
    choiceDomainSub: 'Active Directory',

    // Input Bar
    inputPlaceholder: 'Type your message here ...',
    attachFile: 'Attach file',
    voiceInput: 'Voice input',
    send: 'Send',

    // Right Widgets
    systemStatus: 'System Status',
    connected: 'Connected',
    quickLinks: 'Quick Links',
    linkPasswordReset: 'Reset Password',
    linkPasswordResetSub: 'Direct Link & 5 Steps',
    linkSecurityInfo: 'Security Info Page',
    linkSecurityInfoSub: 'Microsoft Entra',
    linkHelpCenter: 'Microsoft Help Center',
    linkHelpCenterSub: 'All official docs',
    currentTicket: 'Current Ticket',
    noOpenTicket: 'No active ticket currently',
    createNewTicket: 'Create New Ticket',
    ticketConfirmed: 'Ticket Confirmed (SAP)',
    ticketNumber: 'Ticket Number',
    suggestedArticles: 'Suggested Articles',
    articlePassword: 'Microsoft password reset steps',
    articleLocked: 'Resolving locked account issue',
    articleMfa: 'Multi-factor authentication (MFA) issues',
    chatHistory: 'Chat History',
    bookTicket: 'Book Support Ticket',
    newChat: 'New Chat',
    noConversations: 'No recorded past conversations',
    deleteChat: 'Delete Conversation',
    confirmDeleteChat: 'Are you sure you want to delete this chat from the database?',
    ticketBookedSuccess: 'Ticket successfully booked and saved in database',

    // Password Reset Modal & Guide
    passwordModalTitle: 'Microsoft Password Reset Guide & Direct Link',
    passwordModalSub: 'Official verified direct links and 5 step-by-step recovery instructions',
    passwordLinkPersonal: 'Open Official Microsoft Password Reset Page',
    passwordLinkWork: 'Work / School Self-Service Password Reset (SSPR)',
    passwordCopyLink: 'Copy Link',
    passwordCopied: 'Copied!',
    passwordStep1Title: '1. Open Official Recovery Portal',
    passwordStep1Desc: 'Click the direct link above to open Microsoft\'s secure account recovery portal.',
    passwordStep2Title: '2. Enter Account Email or Phone',
    passwordStep2Desc: 'Type your email address (Outlook, Hotmail, or corporate email) or registered phone number and click "Next".',
    passwordStep3Title: '3. Select Identity Verification Method',
    passwordStep3Desc: 'Choose how to receive your security code (SMS text message, alternate email, or Authenticator app).',
    passwordStep4Title: '4. Enter Received Security Code',
    passwordStep4Desc: 'Type the 6-to-8 digit verification code received to confirm your account ownership.',
    passwordStep5Title: '5. Create & Confirm New Password',
    passwordStep5Desc: 'Set a strong new password (minimum 8 characters combining letters, numbers, and symbols), save, and sign in.',
    viewFullGuide: 'View Step-by-Step Guide',
    closeModal: 'Close',

    // Common
    viewAll: 'View All',
    search: 'Search',
    all: 'All',
    status: 'Status',
    priority: 'Priority',
    category: 'Category',
    actions: 'Actions',
    save: 'Save',
    cancel: 'Cancel',
    submit: 'Submit',
    back: 'Back',

    // Dashboard
    dashTitle: 'Dashboard',
    dashSubtitle: 'Overview of IT support performance and metrics',
    statTotalConversations: 'Total Conversations',
    statOpenTickets: 'Open Tickets',
    statResolvedTickets: 'Resolved Tickets',
    statCriticalTickets: 'Critical Tickets',
    dashRecentTickets: 'Recent Tickets',
    dashQuickActions: 'Quick Actions',
    dashSystemOverview: 'System Overview',
    dashResolutionRate: 'Resolution Rate',
    dashAvgResponseTime: 'Avg Response Time',

    // Tickets Page
    ticketsTitle: 'Tickets',
    ticketsSubtitle: 'Manage and track technical support requests & SAP sync',
    searchTicketsPlaceholder: 'Search by ticket # or subject...',
    colTicketNumber: 'Ticket #',
    colSubject: 'Subject',
    colCategory: 'Category',
    colStatus: 'Status',
    colPriority: 'Priority',
    colDate: 'Date',

    // Statuses
    statusOpen: 'Open',
    statusInProgress: 'In Progress',
    statusResolved: 'Resolved',
    statusClosed: 'Closed',
    statusEscalated: 'Escalated',

    // Priorities
    priorityLow: 'Low',
    priorityMedium: 'Medium',
    priorityHigh: 'High',
    priorityCritical: 'Critical',

    // Categories
    catPasswordReset: 'Password Reset',
    catAccountLocked: 'Account Locked',
    catMfa: 'MFA Authentication',
    catWindows: 'Windows',
    catActiveDirectory: 'Active Directory',
    catNetwork: 'Network',
    catM365: 'Microsoft 365',
    catOther: 'Other',

    // Knowledge Base
    kbTitle: 'Knowledge Base',
    kbSubtitle: 'Guides and solutions for common technical issues',
    searchKbPlaceholder: 'Search articles and solutions...',
    kbPopularArticles: 'Popular Articles',
    kbReadTime: 'min read',
    kbViews: 'views',

    // Reports
    reportsTitle: 'Reports & Analytics',
    reportsSubtitle: 'Detailed analytics on volume, performance and SLAs',
    reportVolume: 'Ticket Volume',
    reportDistribution: 'Category Distribution',
    reportResolution: 'Resolution Rate',

    // Users
    usersTitle: 'User Management',
    usersSubtitle: 'Support team members and user directory permissions',
    userColName: 'Name',
    userColEmail: 'Email',
    userColRole: 'Role',
    userColStatus: 'Status',
    roleAdmin: 'System Admin',
    roleAgent: 'Support Agent',
    roleUser: 'User',

    // Settings
    settingsTitle: 'Settings',
    settingsSubtitle: 'Customize your MIR experience',
    sectionAppearance: 'Appearance',
    themeMode: 'Display Mode',
    themeLight: 'Light',
    themeDark: 'Dark',
    sectionLanguage: 'Language & Region',
    uiLanguage: 'Interface Language',
    langArabic: 'العربية',
    langEnglish: 'English',
    sectionNotifications: 'Notifications',
    notifEmail: 'Email Notifications',
    notifPush: 'Push Notifications',
    notifTickets: 'Ticket Updates',
    sectionSecurity: 'Security',
    securityNotice: 'Authentication is fully managed by the backend server. Permissions are enforced on the API layer.',
    saveChanges: 'Save Settings',
    savedSuccess: 'Settings saved successfully!',
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
