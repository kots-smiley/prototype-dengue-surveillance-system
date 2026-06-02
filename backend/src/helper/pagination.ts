import { PaginationMeta } from '../types';

/**
 * Normalize raw page/limit query values into safe integers.
 */
export function parsePagination(
  page?: string | number,
  limit?: string | number,
  defaultLimit = 50,
  maxLimit = 200
): { page: number; limit: number; skip: number } {
  const pageNum = Math.max(1, parseInt(String(page ?? '1'), 10) || 1);
  const limitNum = Math.min(
    maxLimit,
    Math.max(1, parseInt(String(limit ?? defaultLimit), 10) || defaultLimit)
  );
  return { page: pageNum, limit: limitNum, skip: (pageNum - 1) * limitNum };
}

/** Build pagination metadata for a list response. */
export function buildPaginationMeta(
  page: number,
  limit: number,
  total: number
): PaginationMeta {
  return { page, limit, total, pages: Math.ceil(total / limit) || 0 };
}
