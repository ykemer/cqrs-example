import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

export type LoginBody = {
  email: string;
  password: string;
};

export const LOGIN_BODY_SCHEMA: JSONSchemaType<LoginBody> = {
  type: 'object',
  properties: {
    email: {type: 'string', ...VALIDATION_HELPERS.EMAIL_STRING},
    password: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
  },
  required: ['email', 'password'],
  additionalProperties: false,
};
