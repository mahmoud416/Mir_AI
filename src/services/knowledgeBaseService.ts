import { get, post, postForm } from './apiClient';
import type { KBArticle, KBFilters } from '../types/knowledgeBase';

export interface ImportJobResult {
  id: string;
  filename: string;
  file_type: string;
  status: string;
  total: number;
  imported: number;
  skipped: number;
  failed: number;
  errors: string[];
  created_at: string;
  completed_at?: string;
}

interface KBListApiResponse {
  items: KBArticle[];
  articles?: KBArticle[];
  total: number;
}

export const knowledgeBaseService = {
  /**
   * GET /api/v1/knowledge
   * List knowledge base records.
   */
  getArticles: async (filters?: KBFilters): Promise<KBArticle[]> => {
    const params: Record<string, unknown> = {};
    if (filters?.category) params.category = filters.category;
    if (filters?.search) params.search = filters.search;
    const res = await get<KBListApiResponse>('/api/v1/knowledge', params);
    return res.items || res.articles || [];
  },

  /**
   * GET /api/v1/knowledge/:id
   * Get knowledge record details by ID.
   */
  getArticle: (articleId: string): Promise<KBArticle> =>
    get<KBArticle>(`/api/v1/knowledge/${articleId}`),

  /**
   * POST /api/v1/knowledge/import (Admin Protected)
   * Upload JSONL, JSON, or CSV dataset file with configurable mapping.
   */
  importDataset: async (
    file: File,
    fileType: 'jsonl' | 'json' | 'csv' = 'jsonl',
    fieldMapping?: Record<string, string>,
    adminToken?: string
  ): Promise<ImportJobResult> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('file_type', fileType);
    if (fieldMapping && Object.keys(fieldMapping).length > 0) {
      formData.append('field_mapping', JSON.stringify(fieldMapping));
    }
    const headers: Record<string, string> = {};
    if (adminToken) {
      headers['X-Admin-Token'] = adminToken;
    }
    return postForm<ImportJobResult>('/api/v1/knowledge/import', formData, headers);
  },
};
