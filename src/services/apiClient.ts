import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// ─── API Error ────────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public detail?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message = 'Unable to reach the server. Please check your connection.') {
    super(message);
    this.name = 'NetworkError';
  }
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
const TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000;

// ─── Axios Instance ───────────────────────────────────────────────────────────

const createClient = (): AxiosInstance => {
  const client = axios.create({
    baseURL: BASE_URL,
    timeout: TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  // Request interceptor — attach auth token or admin token if available
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('mir_access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const adminToken = localStorage.getItem('mir_admin_token') || import.meta.env.VITE_ADMIN_TOKEN || 'mir-admin-dev-token';
    if (adminToken) {
      config.headers['X-Admin-Token'] = adminToken;
    }
    return config;
  });

  // Response interceptor — normalise errors
  client.interceptors.response.use(
    (response: AxiosResponse) => response,
    (error: AxiosError) => {
      if (error.code === 'ECONNABORTED') {
        return Promise.reject(new NetworkError('Request timed out. Please try again.'));
      }
      if (!error.response) {
        return Promise.reject(new NetworkError());
      }
      const { status, data } = error.response as AxiosResponse<{ detail?: string; code?: string }>;
      return Promise.reject(
        new ApiError(
          status,
          (data as { code?: string }).code || 'UNKNOWN',
          (data as { detail?: string }).detail || `Request failed with status ${status}`,
          data
        )
      );
    }
  );

  return client;
};

export const apiClient = createClient();

// ─── Generic helpers ──────────────────────────────────────────────────────────

export async function get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const res = await apiClient.get<T>(url, { params });
  return res.data;
}

export async function post<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.post<T>(url, data);
  return res.data;
}

export async function put<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.put<T>(url, data);
  return res.data;
}

export async function patch<T>(url: string, data?: unknown): Promise<T> {
  const res = await apiClient.patch<T>(url, data);
  return res.data;
}

export async function del<T>(url: string): Promise<T> {
  const res = await apiClient.delete<T>(url);
  return res.data;
}

export async function postForm<T>(url: string, formData: FormData, customHeaders?: Record<string, string>): Promise<T> {
  const res = await apiClient.post<T>(url, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(customHeaders || {}),
    },
  });
  return res.data;
}
