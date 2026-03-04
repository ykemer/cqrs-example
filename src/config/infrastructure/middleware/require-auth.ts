import {NextFunction, Request, Response} from 'express';

import {NotAuthorizedError} from '@/libs/dto/domain';

const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  if (!req.currentUser) {
    throw new NotAuthorizedError();
  }

  next();
};

export {requireAuth};
