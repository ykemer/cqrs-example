import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type GetCourseParams = {
  id: string;
};

export const GET_COURSE_PARAMS_SCHEMA: JSONSchemaType<GetCourseParams> = {
  type: 'object',
  properties: {
    id: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['id'],
  additionalProperties: false,
};
