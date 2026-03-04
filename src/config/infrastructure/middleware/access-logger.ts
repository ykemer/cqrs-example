import {NextFunction, Request, Response} from 'express';

import {getLogger} from '@/libs/tools/infrastructure';

const logger = getLogger();
const accessLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();

  res.once('finish', () => {
    const duration = process.hrtime(start);
    const durationInMilliseconds = duration[0] * 1000 + duration[1] / 1000000;
    logger.info('Access Log', {
      traceId: req.traceId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${durationInMilliseconds.toFixed(2)} ms`,
      userAgent: req.get('user-agent') || '',
      ip: req.ip,
    });
  });

  next();
};

export {accessLogger};
