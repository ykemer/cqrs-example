import {JSONSchemaType, VALIDATION_HELPERS} from '@/shared';

type CreateClassParams = {
  courseId: string;
};

type CreateClassBody = {
  maxUsers: number;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
};

export const CREATE_CLASS_PARAMS_SCHEMA: JSONSchemaType<CreateClassParams> = {
  type: 'object',
  properties: {
    courseId: {type: 'string', ...VALIDATION_HELPERS.UUID_STRING},
  },
  required: ['courseId'],
  additionalProperties: false,
};

export const CREATE_CLASS_BODY_SCHEMA: JSONSchemaType<CreateClassBody> = {
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
