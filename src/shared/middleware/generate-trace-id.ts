import crypto from 'node:crypto';
import {NextFunction, Request, Response} from 'express';

const generateTraceId = (req: Request, _res: Response, next: NextFunction) => {
  req.traceId = crypto.randomUUID();
  next();
};

export {generateTraceId};
