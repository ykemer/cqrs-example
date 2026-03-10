import {requireAuth} from '@/shared/middleware/require-auth';
import {requireRole} from '@/shared/middleware/require-role';
import {NotAuthorizedError} from '@/shared';
import {Request, Response, NextFunction} from 'express';
import {UserRole} from '@/shared/domain/models/user';

describe('requireAuth and requireRole', () => {
  it('requireAuth throws if no user', () => {
    const req = {currentUser: undefined} as unknown as Request;
    const res = {} as unknown as Response;
    const next = (() => {}) as NextFunction;
    expect(() => requireAuth(req, res, next)).toThrow(NotAuthorizedError);
  });

  it('requireRole throws when user missing', () => {
    const handler = requireRole([UserRole.admin]);
    expect(() => handler({} as unknown as Request, {} as unknown as Response, () => {})).toThrow();
  });

  it('requireRole throws when role not in allowed list', () => {
    const handler = requireRole([UserRole.admin]);
    expect(() =>
      handler({currentUser: {role: UserRole.user}} as unknown as Request, {} as unknown as Response, () => {})
    ).toThrow();
  });

  it('requireRole passes when role allowed', () => {
    const handler = requireRole([UserRole.admin]);
    const next: NextFunction = jest.fn() as unknown as NextFunction;
    handler({currentUser: {role: UserRole.admin}} as unknown as Request, {} as unknown as Response, next);
    expect(next).toHaveBeenCalled();
  });
});
