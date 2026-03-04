import {CustomError} from './custom-error';

class NotAuthorizedError extends CustomError {
  statusCode = 401;
  title = 'Not authorized';
  constructor() {
    super('Not authorized');
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
  serializeErrors() {
    return [{message: this.message}];
  }
}

export {NotAuthorizedError};
