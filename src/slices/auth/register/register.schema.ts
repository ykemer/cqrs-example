import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

export type RegisterBody = {
  email: string;
  name: string;
  password: string;
};

export const REGISTER_BODY_SCHEMA: JSONSchemaType<RegisterBody> = {
  type: 'object',
  properties: {
    email: {type: 'string', ...VALIDATION_HELPERS.EMAIL_STRING},
    name: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
    password: {type: 'string', ...VALIDATION_HELPERS.PASSWORD_STRING},
  },
  required: ['email', 'name', 'password'],
  additionalProperties: false,
};
