import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type ListCoursesQuery = {
  page: number;
  pageSize: number;
};

export const LIST_COURSES_QUERY_SCHEMA: JSONSchemaType<ListCoursesQuery> = {
  type: 'object',
  properties: {
    page: {type: 'integer', ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER},
    pageSize: {type: 'integer', ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER},
  },
  required: [],
  additionalProperties: false,
};
