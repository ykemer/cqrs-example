import {JSONSchemaType} from 'ajv';
import Ajv2019 from 'ajv/dist/2019';
import addFormats from 'ajv-formats';

const ajv = new Ajv2019({
  coerceTypes: true, // Coerce query/param strings to declared types (e.g., "10" -> 10)
  useDefaults: true, // Apply schema defaults (e.g., page: 1)
  removeAdditional: true, // Strip unknown fields from validated data
  strict: false,
});

// Register all standard format validators (email, uuid, date-time, etc.)
ajv.addFormat('safeString', /^[a-zA-Z0-9.,!]+$/);
ajv.addFormat('alphanumeric', /^[a-zA-Z0-9]+$/);
ajv.addFormat('noHtmlJs', /^[^<>{}[\]\\]*$/);
addFormats(ajv);

// Legacy compatibility function
const compileSchema2019 = <T = unknown>(schema: JSONSchemaType<T>, _meta?: boolean) => ajv.compile(schema, _meta);

const VALIDATION_HELPERS = {
  REGULAR_STRING: {format: 'noHtmlJs', minLength: 3, maxLength: 255},
  PASSWORD_STRING: {minLength: 6, maxLength: 255},
  LONG_TEXT_STRING: {format: 'noHtmlJs', minLength: 3, maxLength: 1000},
  EMAIL_STRING: {format: 'email', minLength: 3, maxLength: 255},
  UUID_STRING: {format: 'uuid', maxLength: 36},
  DATETIME_STRING: {format: 'date-time', minLength: 4, maxLength: 50},
  SMALL_POSITIVE_NUMBER_HELPER: {minimum: 1, maximum: 1000},
  PAGE_SIZE_NUMBER_HELPER: {minimum: 1, maximum: 50, default: 10},
  PAGE_NUMBER_HELPER: {minimum: 1, default: 1, maximum: 10_000},
};

export {ajv, compileSchema2019, VALIDATION_HELPERS};
export type {JSONSchemaType};
