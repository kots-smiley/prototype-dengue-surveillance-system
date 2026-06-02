import { Request } from 'express';

/** Standard API response envelope used by every endpoint. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

/** Authenticated user attached to the request by the auth middleware. */
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  barangayId?: string | null;
}

/** Express request carrying the authenticated user. */
export interface AuthRequest extends Request {
  user?: AuthUser;
}

/** Pagination metadata returned alongside list endpoints. */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

/** Generic paginated payload. */
export interface Paginated<T> {
  items: T[];
  pagination: PaginationMeta;
}
