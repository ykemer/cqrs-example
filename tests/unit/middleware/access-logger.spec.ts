import express from 'express';
import request from 'supertest';
import {accessLogger} from '@/shared/middleware/access-logger';
import {getLoggerService} from '@/shared/services/log-service';

describe('accessLogger', () => {
  it('logs on response finish', async () => {
    const logger = getLoggerService();
    jest.spyOn(logger, 'info').mockImplementation(() => {});
    const app = express();
    app.use(accessLogger);
    app.get('/', (_req, res) => res.send('ok'));
    await request(app).get('/');
    expect(logger.info).toHaveBeenCalled();
  });
});
