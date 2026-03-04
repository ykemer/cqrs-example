import {CustomError} from './custom-error';

class ForbiddenError extends CustomError {
  statusCode = 403;
  title = 'Forbidden';
  constructor() {
    super('Forbidden');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
  serializeErrors() {
    return [{message: this.message}];
  }
}

export {ForbiddenError};
