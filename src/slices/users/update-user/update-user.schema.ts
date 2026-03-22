import {JSONSchemaType} from 'ajv';

import {VALIDATION_HELPERS} from '@/shared';

type UpdateUserParams = {
  id: string;
};

type UpdateUserBody = {
  name: string;
  password: string;
  role?: string;
};

export const UPDATE_USER_PARAMS_SCHEMA: JSONSchemaType<UpdateUserParams> = {
  type: 'object',
  properties: {
    id: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['id'],
  additionalProperties: false,
};

export const UPDATE_USER_BODY_SCHEMA: JSONSchemaType<UpdateUserBody> = {
  type: 'object',
  properties: {
    name: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
    password: {type: 'string', ...VALIDATION_HELPERS.PASSWORD_STRING},
    role: {type: 'string', enum: ['admin', 'user'], nullable: true, ...VALIDATION_HELPERS.REGULAR_STRING},
  },
  required: ['name', 'password'],
  additionalProperties: false,
};
