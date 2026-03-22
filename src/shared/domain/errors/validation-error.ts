import {CustomError} from './custom-error';

export interface ValidationErrorItem {
  message: string;
  field?: string;
}

class RequestValidationError extends CustomError {
  statusCode = 400;
  title = 'Request validation error';

  constructor(public errors: ValidationErrorItem[]) {
    super('Request validation error');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  serializeErrors(): ValidationErrorItem[] {
    return this.errors;
  }
}

export {RequestValidationError};
