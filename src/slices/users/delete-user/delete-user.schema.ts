import {JSONSchemaType} from 'ajv';

import {VALIDATION_HELPERS} from '@/shared';

type DeleteUserParams = {
  id: string;
};

export const DELETE_USER_PARAMS_SCHEMA: JSONSchemaType<DeleteUserParams> = {
  type: 'object',
  properties: {
    id: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['id'],
  additionalProperties: false,
};
