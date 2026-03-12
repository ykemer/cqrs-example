import {NextFunction, Request, Response} from 'express';

const mockGetPayload = jest.fn();

jest.mock('@/shared/services/jwt-service', () => ({
  jwtServiceCreator: jest.fn(() => ({
    getPayload: mockGetPayload,
  })),
}));

import {currentUser} from '@/shared/middleware/current-user';

describe('CurrentUser Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
    };
    res = {};
    next = jest.fn();
    mockGetPayload.mockReset();
  });

  it('should call next and not set currentUser if authorization header is missing', () => {
    currentUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.currentUser).toBeUndefined();
  });

  it('should call next and not set currentUser if authorization header does not start with Bearer', () => {
    req.headers!.authorization = 'Basic token123';

    currentUser(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
    expect(req.currentUser).toBeUndefined();
  });

  it('should call next and set currentUser if token is valid', () => {
    const payload = {id: 'user-123', email: 'test@example.com', name: 'Test User', role: 'user'};
    req.headers!.authorization = 'Bearer valid-token';
    mockGetPayload.mockReturnValue(payload);

    currentUser(req as Request, res as Response, next);

    expect(mockGetPayload).toHaveBeenCalledWith('valid-token');
    expect(req.currentUser).toEqual(payload);
    expect(next).toHaveBeenCalled();
  });

  it('should call next and not set currentUser if token is invalid or expired', () => {
    req.headers!.authorization = 'Bearer invalid-token';
    mockGetPayload.mockReturnValue(null);

    currentUser(req as Request, res as Response, next);

    expect(mockGetPayload).toHaveBeenCalledWith('invalid-token');
    expect(req.currentUser).toBeUndefined();
    expect(next).toHaveBeenCalled();
  });

  it('should call next even if getPayload throws an error', () => {
    req.headers!.authorization = 'Bearer error-token';
    const error = new Error('JWT Error');
    mockGetPayload.mockImplementationOnce(() => {
      throw error;
    });

    expect(() => currentUser(req as Request, res as Response, next)).toThrow('JWT Error');

    expect(next).toHaveBeenCalled();
    expect(req.currentUser).toBeUndefined();
  });
});
