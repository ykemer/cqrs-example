import {CustomError} from './custom-error';

class RateLimitError extends CustomError {
  statusCode = 429;
  title = 'Too Many Requests';

  constructor() {
    super('Too Many Requests');
    Object.setPrototypeOf(this, RateLimitError.prototype);
  }
  serializeErrors() {
    return [{message: this.message}];
  }
}

export {RateLimitError};
