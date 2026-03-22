import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type UpdateCourseParams = {
  id: string;
};

type UpdateCourseBody = {
  name: string;
  description: string;
};

export const UPDATE_COURSE_PARAMS_SCHEMA: JSONSchemaType<UpdateCourseParams> = {
  type: 'object',
  properties: {
    id: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['id'],
  additionalProperties: false,
};

export const UPDATE_COURSE_BODY_SCHEMA: JSONSchemaType<UpdateCourseBody> = {
  type: 'object',
  properties: {
    name: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
    description: {type: 'string', ...VALIDATION_HELPERS.LONG_TEXT_STRING},
  },
  required: ['name', 'description'],
  additionalProperties: false,
};
