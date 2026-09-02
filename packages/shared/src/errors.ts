import { ZodError } from 'zod';

export interface FieldError {
  path: string;
  message: string;
}

/**
 * Identity checks against `ZodError` fail when a caller resolves a different
 * copy of zod than the schema that threw. The schemas live in this package, so
 * the check belongs here too, where it always uses the right instance.
 */
export function isZodError(error: unknown): error is ZodError {
  if (error instanceof ZodError) {
    return true;
  }
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as { name?: unknown }).name === 'ZodError' &&
    Array.isArray((error as { issues?: unknown }).issues)
  );
}

export function formatZodIssues(error: ZodError): FieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}
