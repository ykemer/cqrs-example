import {NextFunction, Request, Response} from 'express';

import {CustomError} from '@/shared/domain/errors/custom-error';
import {getLoggerService} from '@/shared/services/log-service';
import {convertErrorToProblemDetails} from '@/shared/utils/convert-error-to-problem-details';

const logger = getLoggerService();

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
