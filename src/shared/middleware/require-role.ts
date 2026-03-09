import {NextFunction, Request, Response} from 'express';

import {ForbiddenError} from '@/shared/domain/errors/forbidden-error';
import {NotAuthorizedError} from '@/shared/domain/errors/not-authorized-error';
import {UserRole} from '@/shared/domain/models/user';

const requireRole = (roles: UserRole[]) => (req: Request, _res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  if (!roles.includes(req.currentUser.role)) {
    throw new ForbiddenError();
  }

  next();
};

export {requireRole};
