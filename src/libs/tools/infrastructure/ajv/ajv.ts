import {JSONSchemaType, Schema, ValidateFunction} from 'ajv';
import Ajv2019 from 'ajv/dist/2019';

const ajv2019 = new Ajv2019({
  removeAdditional: true,
  strict: false,
});
const compileSchema2019 = <T = unknown>(schema: Schema | JSONSchemaType<T>, _meta?: boolean) =>
  ajv2019.compile(schema, _meta);

export type {JSONSchemaType, ValidateFunction};

export {compileSchema2019};
