import { Response } from 'express';
import { ApiResponse } from '../types';

/**
 * Send a standardized success response: { success, message, data }.
 */
export function sendSuccess<T>(
  res: Response,
  data: T,
  message = 'Success',
  statusCode = 200
): Response<ApiResponse<T>> {
  return res.status(statusCode).json({ success: true, message, data });
}

/**
 * Send a standardized error response: { success, message, data: null }.
 */
export function sendError(
  res: Response,
  message: string,
  statusCode = 400,
  data: unknown = null
): Response<ApiResponse<unknown>> {
  return res.status(statusCode).json({ success: false, message, data });
}
