/**
 * Operational error carrying an HTTP status code.
 * Thrown by services/controllers and handled by the global error middleware.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/** Convenience factory mirroring the legacy createError helper. */
export function createError(message: string, statusCode = 400): AppError {
  return new AppError(message, statusCode);
}
