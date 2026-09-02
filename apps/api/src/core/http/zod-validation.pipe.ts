import { ArgumentMetadata, BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodError, ZodTypeAny, z } from 'zod';

export interface ZodFieldError {
  path: string;
  message: string;
}

/**
 * Validates a handler argument against a zod schema and returns the parsed
 * value, so defaults declared in the schema reach the service layer.
 */
export class ZodValidationPipe<T extends ZodTypeAny> implements PipeTransform {
  constructor(private readonly schema: T) {}

  transform(value: unknown, _metadata: ArgumentMetadata): z.infer<T> {
    try {
      return this.schema.parse(value);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new BadRequestException({
          message: 'Validation failed',
          errors: toFieldErrors(error),
        });
      }
      throw error;
    }
  }
}

export function toFieldErrors(error: ZodError): ZodFieldError[] {
  return error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));
}

/** Convenience for the common `@Body(zodBody(schema))` case. */
export const zodBody = <T extends ZodTypeAny>(schema: T): ZodValidationPipe<T> =>
  new ZodValidationPipe(schema);
