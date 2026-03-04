import {NextFunction, Request, Response} from 'express';

import {CustomError} from '@/libs/dto/domain';
import {convertErrorToProblemDetails, getLogger} from '@/libs/tools/infrastructure';

const logger = getLogger();

const errorHandler = (err: Error, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err instanceof CustomError ? err.statusCode : 503;

  if (err instanceof CustomError) {
    logger.warn({
      url: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: err.stack,
      traceId: req.traceId,
    });
  } else {
    logger.error({
      url: req.originalUrl,
      method: req.method,
      message: err.message,
      stack: err.stack,
      traceId: req.traceId,
    });
  }

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(statusCode).send(convertErrorToProblemDetails(err, statusCode, req));
};

export {errorHandler};
