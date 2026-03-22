import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

export type EnrollToClassSchema = {
  classId: string;
  courseId: string;
};

export const ENROLL_TO_CLASS_PARAMS_SCHEMA: JSONSchemaType<EnrollToClassSchema> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
    classId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId', 'classId'],
  additionalProperties: false,
};
