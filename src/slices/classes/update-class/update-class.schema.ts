import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type UpdateClassParams = {
  courseId: string;
  classId: string;
};

type UpdateClassBody = {
  maxUsers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
};

export const UPDATE_CLASS_PARAMS_SCHEMA: JSONSchemaType<UpdateClassParams> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
    classId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId', 'classId'],
  additionalProperties: false,
};

export const UPDATE_CLASS_BODY_SCHEMA: JSONSchemaType<UpdateClassBody> = {
  type: 'object',
  properties: {
    maxUsers: {type: 'integer', ...VALIDATION_HELPERS.SMALL_POSITIVE_NUMBER_HELPER},
    registrationDeadline: {type: 'string', ...VALIDATION_HELPERS.DATETIME_STRING},
    startDate: {type: 'string', ...VALIDATION_HELPERS.DATETIME_STRING},
    endDate: {type: 'string', ...VALIDATION_HELPERS.DATETIME_STRING},
  },
  required: ['maxUsers', 'registrationDeadline', 'startDate', 'endDate'],
  additionalProperties: false,
};
