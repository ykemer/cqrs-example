import {JSONSchemaType} from 'ajv';

import {VALIDATION_HELPERS} from '@/shared';

type ListUsersQuery = {
  page: number;
  pageSize: number;
};

export const LIST_USERS_QUERY_SCHEMA: JSONSchemaType<ListUsersQuery> = {
  type: 'object',
  properties: {
    page: {type: 'integer', ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER},
    pageSize: {type: 'integer', ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER},
  },
  required: [],
  additionalProperties: false,
};
