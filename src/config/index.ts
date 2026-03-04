import express, {json} from 'express';

import {healthRouter} from '@/config/infrastructure/health/health-routes';
import {accessLogger, currentUser, errorHandler} from '@/config/infrastructure/middleware';
import {generateTraceId} from '@/config/infrastructure/middleware/generate-trace-id';
import {configureRouters} from '@/config/infrastructure/routes/configure-routers';
import {configureSecurity} from '@/config/infrastructure/security/security';
import {swaggerRouter} from '@/config/infrastructure/swagger/swagger';
import {NotFoundError} from '@/libs/dto/domain';
import {sequelize} from '@/libs/tools/infrastructure/persistence/config/database';
import {createHealthService} from '@/libs/tools/infrastructure/services';

const app = express();
const getConfiguredApp = () => {
  app.use(json());
  configureSecurity(app);
  app.use(generateTraceId);
  app.use(accessLogger);
  app.use(currentUser);

  configureRouters(app);
  app.use(swaggerRouter);
  const healthService = createHealthService(sequelize);
  app.use('/_health', healthRouter(healthService));
  app.all('/{*splat}', async () => {
    throw new NotFoundError('Resource not found');
  });

  app.use(errorHandler);
  return app;
};

export {getConfiguredApp};
