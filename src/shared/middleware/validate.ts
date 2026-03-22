import {JSONSchemaType, SchemaObject} from 'ajv';
import {NextFunction, Request, Response} from 'express';

import {RequestValidationError, ValidationErrorItem} from '@/shared/domain/errors/validation-error';
import {compileSchema2019} from '@/shared/utils/ajv';

/**
 * Validation schemas configuration
 * Each property is optional, allowing flexible validation of different request parts
 */
type ValidationSchemas<TParams = unknown, TQuery = unknown, TBody = unknown> = {
  params?: JSONSchemaType<TParams>;
  query?: JSONSchemaType<TQuery>;
  body?: JSONSchemaType<TBody>;
};

/**
 * Transform AJV JSON Pointer path to dot-notation field name
 * Example: "/maxUsers" -> "maxUsers", "/nested/field" -> "nested.field"
 */
function extractFieldName(instancePath: string): string {
  if (!instancePath || instancePath === '/') return '';
  return instancePath.substring(1).replace(/\//g, '.');
}

/**
 * Map AJV error codes to user-friendly messages
 */
function getErrorMessage(error: any): string {
  const {keyword, params = {}} = error;

  const messageMap: Record<string, (params: any) => string> = {
    required: () => `"${params.missingProperty}" is required`,
    type: () => `Must be of type ${params.type}`,
    format: () => `Must be a valid ${params.format}`,
    minimum: () => `Must be at least ${params.limit}`,
    maximum: () => `Must be at most ${params.limit}`,
    minLength: () => `Must be at least ${params.limit} characters`,
    maxLength: () => `Must be at most ${params.limit} characters`,
    enum: () => `Must be one of: ${Array.isArray(params.allowedValues) ? params.allowedValues.join(', ') : 'unknown'}`,
    pattern: () => `Invalid format`,
    datesBefore: () => params.message || error.message,
  };

  const messageFn = messageMap[keyword];
  if (messageFn) {
    try {
      return messageFn(params);
    } catch {
      // Fallback if params are missing
      return error.message || 'Validation failed';
    }
  }

  return error.message || 'Validation failed';
}

/**
 * Convert AJV errors to ValidationErrorItem array
 */
function transformErrors(errors: any[]): ValidationErrorItem[] {
  return errors.map(error => {
    const field = extractFieldName(error.instancePath);
    return {
      message: getErrorMessage(error),
      ...(field && {field}),
    };
  });
}

/**
 * Validation middleware factory with generic typing
 * The generic types TParams, TQuery, TBody are inferred from the schemas
 * This properly types req.params, req.query, and req.body
 */
export function validate<TParams = unknown, TQuery = unknown, TBody = unknown>(
  schemas: ValidationSchemas<TParams, TQuery, TBody>
) {
  // Compile schemas once at middleware creation time
  let paramsValidator: any = null;
  let queryValidator: any = null;
  let bodyValidator: any = null;

  try {
    if (schemas.params) paramsValidator = compileSchema2019(schemas.params);
    if (schemas.query) queryValidator = compileSchema2019(schemas.query);
    if (schemas.body) bodyValidator = compileSchema2019(schemas.body);
  } catch (err: any) {
    return (_req: Request<TParams, any, TBody, TQuery>, _res: Response, next: NextFunction) => {
      throw new RequestValidationError([
        {
          message: `Schema compilation error: ${err.message}`,
        },
      ]);
    };
  }

  return (req: Request<TParams, any, TBody, TQuery>, _res: Response, next: NextFunction) => {
    const errors: ValidationErrorItem[] = [];

    // Validate params
    if (paramsValidator) {
      const valid = paramsValidator(req.params);
      if (!valid && paramsValidator.errors) {
        errors.push(...transformErrors(paramsValidator.errors));
      }
    }

    // Validate query
    if (queryValidator) {
      const valid = queryValidator(req.query);
      if (!valid && queryValidator.errors) {
        errors.push(...transformErrors(queryValidator.errors));
      }
    }

    // Validate body
    if (bodyValidator) {
      const valid = bodyValidator(req.body);
      if (!valid && bodyValidator.errors) {
        errors.push(...transformErrors(bodyValidator.errors));
      }
    }

    // If there are any errors, throw RequestValidationError
    if (errors.length > 0) {
      throw new RequestValidationError(errors);
    }

    next();
  };
}
