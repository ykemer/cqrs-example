import {Request, Response, Router} from 'express';

import {HealthServiceInterface} from '@/libs/tools/domain';

const router = Router();
export const healthRouter = (healthService: HealthServiceInterface): Router => {
  router.get('/', async (_req: Request, res: Response) => {
    const dbConnected = await healthService.checkDatabase();

    res.status(dbConnected ? 200 : 500).json({
      status: dbConnected ? 'healthy' : 'unhealthy',
      database: dbConnected ? 'connected' : 'disconnected',
    });
  });

  return router;
};
