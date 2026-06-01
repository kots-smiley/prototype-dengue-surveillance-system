const rawBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const normalized = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

/** Minimal public Fetch wrapper (no auth) for the forecast site. */
export async function apiGet<T>(endpoint: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
  });

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
