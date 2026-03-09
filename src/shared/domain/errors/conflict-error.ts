import {CustomError} from './custom-error';

class ConflictError extends CustomError {
  statusCode = 409;
  title = 'Conflict';
  constructor(message: string) {
    super(message);
    this.title = message;
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
  serializeErrors() {
    return [{message: this.message}];
  }
}

export {ConflictError};
