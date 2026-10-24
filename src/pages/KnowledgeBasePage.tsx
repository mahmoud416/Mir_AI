import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  BookOpen,
  ExternalLink,
  Eye,
  Plus,
  Shield,
  Key,
  Lock,
  Monitor,
  Server,
  Wifi,
  Grid,
  Upload,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DemoBanner } from '../components/ui/DemoBanner';
import { demoKBArticles } from '../services/demoData';
import { knowledgeBaseService, type ImportJobResult } from '../services/knowledgeBaseService';
import type { KBArticle, KBCategory } from '../types/knowledgeBase';

const CATEGORY_CONFIG: Record<
  KBCategory,
  { labelAr: string; labelEn: string; icon: React.ElementType; color: string; bg: string }
> = {
  password_reset: {
    labelAr: 'إعادة كلمة المرور',
    labelEn: 'Password Reset',
    icon: Key,
    color: 'text-blue-600',
    bg: 'bg-blue-50 dark:bg-blue-900/30',
  },
  account_locked: {
    labelAr: 'حساب مقفل',
    labelEn: 'Account Locked',
    icon: Lock,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-900/30',
  },
  mfa: {
    labelAr: 'المصادقة الثنائية',
    labelEn: 'MFA Authentication',
    icon: Shield,
    color: 'text-purple-600',
    bg: 'bg-purple-50 dark:bg-purple-900/30',
  },
  windows: {
    labelAr: 'Windows',
    labelEn: 'Windows',
    icon: Monitor,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-900/30',
  },
  active_directory: {
    labelAr: 'Active Directory',
    labelEn: 'Active Directory',
    icon: Server,
    color: 'text-orange-600',
    bg: 'bg-orange-50 dark:bg-orange-900/30',
  },
  network: {
    labelAr: 'الشبكة',
    labelEn: 'Network',
    icon: Wifi,
    color: 'text-cyan-600',
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
  },
  microsoft_365: {
    labelAr: 'Microsoft 365',
    labelEn: 'Microsoft 365',
    icon: Grid,
    color: 'text-indigo-600',
    bg: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
};

const ACCOUNT_TYPE_LABELS: Record<string, { ar: string; en: string }> = {
  personal: { ar: 'شخصي', en: 'Personal' },
  work_school: { ar: 'العمل / الدراسة', en: 'Work/School' },
  domain: { ar: 'Domain', en: 'Domain' },
  all: { ar: 'الكل', en: 'All' },
};

function ArticleCard({ article }: { article: KBArticle }) {
  const { language } = useApp();
  const isEn = language === 'en';
  const config = CATEGORY_CONFIG[article.category];
  const Icon = config?.icon || BookOpen;

  return (
    <div className="card hover:shadow-medium transition-all duration-200 group flex flex-col">
      {/* Top */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl ${
            config?.bg || 'bg-slate-50'
          } flex items-center justify-center flex-shrink-0`}
        >
          <Icon className={`w-5 h-5 ${config?.color || 'text-slate-500'}`} />
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {article.isOfficial && (
            <span className="badge bg-green-50 text-green-700 border border-green-200 flex items-center gap-1">
              <Shield className="w-2.5 h-2.5" />
              {isEn ? 'Official' : 'رسمي'}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-2 leading-relaxed group-hover:text-primary-600 transition-colors">
        {isEn ? article.title : article.titleAr || article.title}
      </h3>

      {/* Summary */}
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex-1 mb-3">
        {isEn ? article.summary : article.summaryAr || article.summary}
      </p>

      {/* Account types */}
      <div className="flex flex-wrap gap-1 mb-3">
        {(article.accountTypes || ['work_school']).map((at) => (
          <span
            key={at}
            className="badge bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 text-[10px]"
          >
            {isEn ? ACCOUNT_TYPE_LABELS[at]?.en || at : ACCOUNT_TYPE_LABELS[at]?.ar || at}
          </span>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Eye className="w-3 h-3" />
          <span>{article.views?.toLocaleString(isEn ? 'en-US' : 'ar-SA') || 0}</span>
        </div>
        {article.sourceUrl && (
          <a
            href={article.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{isEn ? 'Official Source' : 'المصدر الرسمي'}</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { isDemo, language, t } = useApp();
  const isEn = language === 'en';
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<KBCategory | ''>('');
  const [articles, setArticles] = useState<KBArticle[]>(demoKBArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Dataset Import Modal State
  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'jsonl' | 'json' | 'csv'>('jsonl');
  const [adminToken, setAdminToken] = useState(
    (import.meta.env.VITE_ADMIN_TOKEN as string) || 'mir-admin-dev-token'
  );
  const [customMapping, setCustomMapping] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportJobResult | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const fetchArticles = useCallback(async () => {
    if (isDemo) {
      setArticles(demoKBArticles);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const items = await knowledgeBaseService.getArticles({
        category: categoryFilter || undefined,
        search: search.trim() || undefined,
      });
      setArticles(items.length > 0 ? items : demoKBArticles);
    } catch (err: any) {
      console.warn('Failed to fetch from backend KB, falling back to demo articles:', err);
      setError(
        isEn
          ? 'Backend unavailable, displaying local knowledge articles.'
          : 'تعذر الاتصال بالخادم، يتم عرض المقالات المحلية.'
      );
      setArticles(demoKBArticles);
    } finally {
      setIsLoading(false);
    }
  }, [isDemo, categoryFilter, search, isEn]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  const filtered = useMemo(() => {
    return articles.filter((a) => {
      const matchSearch =
        !search ||
        a.titleAr?.includes(search) ||
        a.title?.toLowerCase().includes(search.toLowerCase()) ||
        a.summaryAr?.includes(search) ||
        a.summary?.toLowerCase().includes(search.toLowerCase()) ||
        a.tags?.some((tkt) => tkt.toLowerCase().includes(search.toLowerCase()));
      const matchCategory = !categoryFilter || a.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [articles, search, categoryFilter]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setImportResult(null);
      setImportError(null);
      if (file.name.endsWith('.csv')) {
        setFileType('csv');
      } else if (file.name.endsWith('.json')) {
        setFileType('json');
      } else {
        setFileType('jsonl');
      }
    }
  };

  const handleImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsImporting(true);
    setImportError(null);
    setImportResult(null);

    let mappingObj: Record<string, string> | undefined;
    if (customMapping.trim()) {
      try {
        mappingObj = JSON.parse(customMapping);
      } catch (err) {
        setImportError(
          isEn
            ? 'Invalid JSON in custom field mapping.'
            : 'تنسيق JSON غير صالح في تعيين الحقول.'
        );
        setIsImporting(false);
        return;
      }
    }

    try {
      const result = await knowledgeBaseService.importDataset(
        selectedFile,
        fileType,
        mappingObj,
        adminToken
      );
      setImportResult(result);
      // Refresh articles list to reflect newly imported items
      fetchArticles();
    } catch (err: any) {
      setImportError(err.message || (isEn ? 'Dataset import failed' : 'فشل استيراد البيانات'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{t('kbTitle')}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {filtered.length} {isEn ? 'Articles Available' : 'مقالة متاحة'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DemoBanner />
          
          <button
            id="refresh-kb-btn"
            onClick={() => fetchArticles()}
            disabled={isLoading}
            className="btn-secondary text-sm p-2"
            title={isEn ? 'Refresh' : 'تحديث'}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Admin Dataset Import Button */}
          <button
            id="btn-import-dataset"
            onClick={() => setShowImportModal(true)}
            className="btn-secondary text-sm flex items-center gap-1.5 border-primary-200 text-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/40"
            title={isEn ? 'Import Dataset (Admin)' : 'استيراد مجموعة بيانات (مسؤول)'}
          >
            <Upload className="w-4 h-4 text-primary-600" />
            <span>{isEn ? 'Import Dataset' : 'استيراد بيانات'}</span>
          </button>

          <button
            id="add-article-btn"
            className="btn-secondary text-sm"
            title={isEn ? 'Requires admin permissions' : 'تتطلب صلاحية مسؤول'}
          >
            <Plus className="w-4 h-4" />
            {isEn ? 'New Article' : 'مقالة جديدة'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => fetchArticles()} className="underline font-bold">
            {isEn ? 'Retry' : 'إعادة المحاولة'}
          </button>
        </div>
      )}

      {/* Search and category filters */}
      <div className="space-y-3">
        <div className="relative">
          <Search
            className={`absolute ${
              language === 'ar' ? 'right-3.5' : 'left-3.5'
            } top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none`}
          />
          <input
            id="kb-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('searchKbPlaceholder')}
            className={`input-field ${language === 'ar' ? 'pr-10' : 'pl-10'}`}
          />
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategoryFilter('')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
              !categoryFilter
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {isEn ? 'All Categories' : 'كل الفئات'}
          </button>
          {Object.entries(CATEGORY_CONFIG).map(([k, cfg]) => (
            <button
              key={k}
              onClick={() => setCategoryFilter(k as KBCategory)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1.5 ${
                categoryFilter === k
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              <cfg.icon className="w-3 h-3" />
              <span>{isEn ? cfg.labelEn : cfg.labelAr}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
          <p className="text-sm text-slate-400">
            {isEn ? 'Loading knowledge base...' : 'جاري تحميل مقالات المعرفة...'}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-700 dark:text-slate-200">
            {isEn ? 'No articles found' : 'لا توجد مقالات مطابقة'}
          </h3>
          <p className="text-xs text-slate-400">
            {isEn
              ? 'Try modifying your search keywords or category filter.'
              : 'جرّب تعديل كلمات البحث أو الفلتر المختار.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <ArticleCard key={art.id} article={art} />
          ))}
        </div>
      )}

      {/* ── Admin Dataset Import Modal ── */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                  <Upload className="w-4 h-4 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-800 dark:text-white">
                    {isEn ? 'Import Helpdesk Dataset' : 'استيراد مجموعة بيانات الدعم'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isEn ? 'Upload JSONL, JSON, or CSV into MongoDB Atlas' : 'رفع ملف JSONL أو JSON أو CSV إلى قاعدة البيانات'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              {/* File upload picker */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  {isEn ? 'Dataset File (.jsonl, .json, .csv)' : 'ملف البيانات'}
                </label>
                <input
                  type="file"
                  accept=".jsonl,.json,.csv,text/csv,application/json"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer border border-slate-200 dark:border-slate-700 rounded-xl p-1"
                  required
                />
              </div>

              {/* Format selection */}
              <div className="grid grid-cols-3 gap-2">
                {(['jsonl', 'json', 'csv'] as const).map((fmt) => (
                  <button
                    type="button"
                    key={fmt}
                    onClick={() => setFileType(fmt)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold uppercase transition-all ${
                      fileType === fmt
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              {/* Admin Token */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Admin Security Token' : 'رمز أمان الإدارة (Admin Token)'}
                </label>
                <input
                  type="password"
                  value={adminToken}
                  onChange={(e) => setAdminToken(e.target.value)}
                  placeholder="mir-admin-dev-token"
                  className="input-field text-xs"
                  required
                />
              </div>

              {/* Optional Field Mapping */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isEn ? 'Custom Field Mapping (Optional JSON)' : 'تعيين الحقول المخصص (اختياري)'}
                </label>
                <textarea
                  rows={2}
                  value={customMapping}
                  onChange={(e) => setCustomMapping(e.target.value)}
                  placeholder='{"title_ar": "question", "description_ar": "answer"}'
                  className="input-field text-xs font-mono resize-none"
                />
              </div>

              {/* Error message */}
              {importError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              {/* Import Result Box */}
              {importResult && (
                <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      {isEn ? 'Import Complete' : 'اكتمل الاستيراد بنجاح'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center pt-1">
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <p className="text-[10px] text-slate-400">{isEn ? 'Total' : 'الإجمالي'}</p>
                      <p className="font-bold text-slate-800 dark:text-white">{importResult.total}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <p className="text-[10px] text-emerald-600">{isEn ? 'Imported' : 'تم استيراده'}</p>
                      <p className="font-bold text-emerald-700 dark:text-emerald-400">{importResult.imported}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <p className="text-[10px] text-amber-500">{isEn ? 'Skipped' : 'تخطي'}</p>
                      <p className="font-bold text-amber-600">{importResult.skipped}</p>
                    </div>
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900">
                      <p className="text-[10px] text-red-500">{isEn ? 'Failed' : 'فشل'}</p>
                      <p className="font-bold text-red-600">{importResult.failed}</p>
                    </div>
                  </div>
                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="text-[11px] text-amber-700 bg-amber-50/50 p-2 rounded">
                      <p className="font-semibold">{isEn ? 'Import Notes:' : 'ملاحظات:'}</p>
                      <ul className="list-disc list-inside">
                        {importResult.errors.slice(0, 3).map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImportModal(false)}
                  className="btn-secondary text-xs"
                >
                  {isEn ? 'Close' : 'إغلاق'}
                </button>
                <button
                  type="submit"
                  disabled={!selectedFile || isImporting}
                  className="btn-primary text-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>{isEn ? 'Importing...' : 'جاري الاستيراد...'}</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Start Import' : 'بدء الاستيراد'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

