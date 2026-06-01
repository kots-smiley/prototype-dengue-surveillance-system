import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodEffects } from 'zod';

type Schema = AnyZodObject | ZodEffects<AnyZodObject>;

/**
 * Validate a request section against a Zod schema before the controller runs.
 * The parsed (and coerced) value replaces the original request section.
 */
export function validate(schema: Schema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      // Reassign so controllers receive the coerced/validated values.
      (req as unknown as Record<string, unknown>)[source] = parsed;
      next();
    } catch (error) {
      next(error);
    }
  };
}
