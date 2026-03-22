import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type CreateCourseBody = {
  name: string;
  description: string;
};

export const CREATE_COURSE_BODY_SCHEMA: JSONSchemaType<CreateCourseBody> = {
  type: 'object',
  properties: {
    name: {type: 'string', ...VALIDATION_HELPERS.REGULAR_STRING},
    description: {type: 'string', ...VALIDATION_HELPERS.LONG_TEXT_STRING},
  },
  required: ['name', 'description'],
  additionalProperties: false,
};
