/** App-wide constants and configuration. No hardcoded values in components. */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Ensure the base URL targets the /api prefix even if only the domain is set.
const normalized = rawBaseUrl.replace(/\/+$/, '');
export const API_BASE_URL = normalized.endsWith('/api') ? normalized : `${normalized}/api`;

export const APP_NAME = 'HealthWatch';
export const APP_FULL_NAME =
  'HealthWatch — Multi-Disease Surveillance & Early Warning System';
export const APP_LOCATION = 'Municipality of Lopez, Quezon';

export const TOKEN_STORAGE_KEY = 'healthwatch_token';

export const DEFAULT_PAGE_SIZE = 50;
export const PAGE_SIZE_OPTIONS = [25, 50, 100, 200];
