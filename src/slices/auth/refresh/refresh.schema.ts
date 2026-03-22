import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

export type RefreshBody = {
  refreshToken: string;
};

export const REFRESH_BODY_SCHEMA: JSONSchemaType<RefreshBody> = {
  type: 'object',
  properties: {
    refreshToken: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
  },
  required: ['refreshToken'],
  additionalProperties: false,
};
