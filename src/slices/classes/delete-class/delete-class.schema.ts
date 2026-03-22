import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type DeleteClassParams = {
  courseId: string;
  classId: string;
};

export const DELETE_CLASS_PARAMS_SCHEMA: JSONSchemaType<DeleteClassParams> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
    classId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId', 'classId'],
  additionalProperties: false,
};
