import {CustomError} from './custom-error';

class NotFoundError extends CustomError {
  statusCode = 404;
  title = 'Not found';

  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
  serializeErrors() {
    return [{message: this.message}];
  }
}

export {NotFoundError};
