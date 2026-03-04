import {Express} from 'express';
import {rateLimit} from 'express-rate-limit';

import {RateLimitError} from '@/libs/dto/domain';

const configureSecurity = (app: Express) => {
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-8',
      handler: () => {
        throw new RateLimitError();
      },
    })
  );

  app.disable('x-powered-by');
  app.disable('server');
};

export {configureSecurity};
