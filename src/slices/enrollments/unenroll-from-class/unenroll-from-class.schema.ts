import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type UnenrollFromClassSchema = {
  classId: string;
  courseId: string;
};

export const UNENROLL_FROM_CLASS_PARAMS_SCHEMA: JSONSchemaType<UnenrollFromClassSchema> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
    classId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId', 'classId'],
  additionalProperties: false,
};
