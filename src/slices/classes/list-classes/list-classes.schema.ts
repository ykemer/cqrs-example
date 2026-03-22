import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type ListClassesParams = {
  courseId: string;
};

type ListClassesQuery = {
  page: number;
  pageSize: number;
};

export const LIST_CLASSES_PARAMS_SCHEMA: JSONSchemaType<ListClassesParams> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId'],
  additionalProperties: false,
};

export const LIST_CLASSES_QUERY_SCHEMA: JSONSchemaType<ListClassesQuery> = {
  type: 'object',
  properties: {
    page: {type: 'integer', ...VALIDATION_HELPERS.PAGE_NUMBER_HELPER},
    pageSize: {type: 'integer', ...VALIDATION_HELPERS.PAGE_SIZE_NUMBER_HELPER},
  },
  required: [],
  additionalProperties: false,
};
