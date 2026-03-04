import {NextFunction, Request, Response} from 'express';

import {ForbiddenError, NotAuthorizedError} from '@/libs/dto/domain';
import {UserRole} from '@/libs/tools/domain/persistence/models/user';

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
