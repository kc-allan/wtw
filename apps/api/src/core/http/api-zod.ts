import { applyDecorators } from '@nestjs/common';
import { ApiBody, ApiQuery } from '@nestjs/swagger';
import { ZodTypeAny } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

type JsonSchema = Record<string, unknown>;

// Called through a narrowed signature; the library's own generic makes
// TypeScript give up on inference at this depth.
const convert = zodToJsonSchema as unknown as (
  schema: ZodTypeAny,
  options: Record<string, unknown>,
) => JsonSchema;

const toSchema = (schema: ZodTypeAny, name: string): JsonSchema =>
  convert(schema, { name, target: 'openApi3', $refStrategy: 'none' });

/**
 * Swagger reads its request shapes from decorator metadata, which zod schemas
 * do not carry. These convert one into the other so the docs stay accurate
 * without a parallel set of DTO classes.
 */
export function ApiZodBody(schema: ZodTypeAny, name = 'Body') {
  const converted = toSchema(schema, name);
  const definitions = (converted.definitions ?? {}) as Record<string, JsonSchema>;
  return applyDecorators(ApiBody({ schema: definitions[name] ?? converted }));
}

export function ApiZodQuery(schema: ZodTypeAny, name = 'Query') {
  const converted = toSchema(schema, name);
  const definitions = (converted.definitions ?? {}) as Record<string, JsonSchema>;
  const resolved = (definitions[name] ?? converted) as {
    properties?: Record<string, JsonSchema>;
    required?: string[];
  };
  const properties = resolved.properties ?? {};
  const requiredFields = new Set(resolved.required ?? []);

  return applyDecorators(
    ...Object.entries(properties).map(([key, property]) =>
      ApiQuery({ name: key, required: requiredFields.has(key), schema: property }),
    ),
  );
}
