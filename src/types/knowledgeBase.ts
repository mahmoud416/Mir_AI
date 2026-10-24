// ─── Knowledge Base Types ─────────────────────────────────────────────────────

export type KBCategory =
  | 'password_reset'
  | 'account_locked'
  | 'mfa'
  | 'windows'
  | 'active_directory'
  | 'network'
  | 'microsoft_365';

export type AccountTypeSupport = 'personal' | 'work_school' | 'domain' | 'all';

export interface KBArticle {
  id: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  content?: string;
  contentAr?: string;
  category: KBCategory;
  accountTypes: AccountTypeSupport[];
  sourceUrl?: string;
  isOfficial: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  views?: number;
}

export interface KBFilters {
  category?: KBCategory;
  search?: string;
  accountType?: AccountTypeSupport;
}
