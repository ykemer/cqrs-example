import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type GetClassParams = {
  courseId: string;
  classId: string;
};

export const GET_CLASS_PARAMS_SCHEMA: JSONSchemaType<GetClassParams> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
    classId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId', 'classId'],
  additionalProperties: false,
};
