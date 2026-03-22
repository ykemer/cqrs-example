import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type DeleteCourseParams = {
  id: string;
};

export const DELETE_COURSE_PARAMS_SCHEMA: JSONSchemaType<DeleteCourseParams> = {
  type: 'object',
  properties: {
    id: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['id'],
  additionalProperties: false,
};
