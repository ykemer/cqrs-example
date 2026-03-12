import dotenv from 'dotenv';

dotenv.config();

import express, {json, Request, Response} from 'express';
import {rateLimit} from 'express-rate-limit';

import {
  accessLogger,
  createHealthService,
  currentUser,
  errorHandler,
  generateTraceId,
  NotFoundError,
  RateLimitError,
  sequelize,
  setupPersistence,
  swaggerRouter,
} from '@/shared';
import {registerAuthRoutes} from '@/slices/auth';
import {registerClassRoutes} from '@/slices/classes';
import {registerCourseRoutes} from '@/slices/courses';
import {registerEnrollmentsRoutes} from '@/slices/enrollments';
import {registerUserRoutes} from '@/slices/users';
import 'reflect-metadata';

const app = express();

const getConfiguredApp = () => {
  const healthService = createHealthService(sequelize);
  app.use(json());
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

  app.use(generateTraceId);
  app.use(accessLogger);
  app.use(currentUser);

  registerAuthRoutes(app);
  registerCourseRoutes(app);
  registerClassRoutes(app);
  registerEnrollmentsRoutes(app);
  registerUserRoutes(app);

  app.use(swaggerRouter);

  app.get('/_health', async (_req: Request, res: Response) => {
    const dbConnected = await healthService.checkDatabase();

    res.status(dbConnected ? 200 : 500).json({
      status: dbConnected ? 'healthy' : 'unhealthy',
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });
  app.all('/{*splat}', async () => {
    throw new NotFoundError('Resource not found');
  });

  app.use(errorHandler);
  return app;
};

const start = async () => {
  await setupPersistence();
  const app = getConfiguredApp();

  app.listen(3000, () => {
    console.log('Application is running on port 3000. http://localhost:3000');
  });
};

(async () => {
  await start();
})();
