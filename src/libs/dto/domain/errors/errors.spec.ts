import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotAuthorizedError,
  NotFoundError,
  RateLimitError,
} from './index';

describe('Error Classes', () => {
  it('BadRequestError should have correct properties', () => {
    const error = new BadRequestError('test error');
    expect(error.statusCode).toBe(400);
    expect(error.serializeErrors()).toEqual([{message: 'test error'}]);
  });

  it('ConflictError should have correct properties', () => {
    const error = new ConflictError('test error');
    expect(error.statusCode).toBe(409);
    expect(error.serializeErrors()).toEqual([{message: 'test error'}]);
  });

  it('ForbiddenError should have correct properties', () => {
    const error = new ForbiddenError();
    expect(error.statusCode).toBe(403);
    expect(error.serializeErrors()).toEqual([{message: 'Forbidden'}]);
  });

  it('NotAuthorizedError should have correct properties', () => {
    const error = new NotAuthorizedError();
    expect(error.statusCode).toBe(401);
    expect(error.serializeErrors()).toEqual([{message: 'Not authorized'}]);
  });

  it('NotFoundError should have correct properties', () => {
    const error = new NotFoundError('Not Found');
    expect(error.statusCode).toBe(404);
    expect(error.serializeErrors()).toEqual([{message: 'Not Found'}]);
  });

  it('RateLimitError should have correct properties', () => {
    const error = new RateLimitError();
    expect(error.statusCode).toBe(429);
    expect(error.serializeErrors()).toEqual([{message: 'Too Many Requests'}]);
  });
});
