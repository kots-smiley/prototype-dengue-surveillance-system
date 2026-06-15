const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalized = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Minimal public Fetch wrapper (no auth) for the forecast site. */
async function parseResponse<T>(response: Response): Promise<T> {
  let payload: ApiResponse<T> | null = null;
  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || `Request failed (${response.status})`);
  }
  return payload.data;
}

export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });
  return parseResponse<T>(response);
}

export async function apiPost<T>(endpoint: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return parseResponse<T>(response);
}
