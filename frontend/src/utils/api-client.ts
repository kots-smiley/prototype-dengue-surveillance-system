import { API_BASE_URL, TOKEN_STORAGE_KEY } from '../configuration/constants';
import { ApiResponse } from '../types';

/** Error thrown for non-2xx API responses, carrying the status and message. */
export class ApiError extends Error {
  public readonly status: number;
  public readonly data: unknown;

  constructor(message: string, status: number, data: unknown = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  /** Skip attaching the auth token (e.g. public endpoints). */
  skipAuth?: boolean;
}

/**
 * Centralized Fetch wrapper. All services call through this.
 * Returns the parsed { success, message, data } envelope.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { body, skipAuth, headers, ...rest } = options;

  const finalHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (!skipAuth) {
    const token = getToken();
    if (token) finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...rest,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Network error. Please check your connection.', 0);
  }

  // Handle expired/invalid sessions globally.
  if (response.status === 401 && !skipAuth) {
    clearToken();
  }

  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const message = payload?.message || `Request failed (${response.status})`;
    throw new ApiError(message, response.status, payload?.data ?? null);
  }

  return payload;
}

/** Build a query string from a params object, skipping empty values. */
export function buildQuery(params: object): string {
  const search = new URLSearchParams();
  Object.entries(params as Record<string, unknown>).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      search.append(key, String(value));
    }
  });
  const str = search.toString();
  return str ? `?${str}` : '';
}

/**
 * Download a file from an authenticated endpoint and trigger a browser save.
 */
export async function downloadFile(endpoint: string, fallbackName: string): Promise<void> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (!response.ok) {
    throw new ApiError(`Download failed (${response.status})`, response.status);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition') || '';
  const match = disposition.match(/filename="?([^"]+)"?/);
  const filename = match?.[1] || fallbackName;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
