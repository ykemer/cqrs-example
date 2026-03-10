import express from 'express';
import request from 'supertest';
import {generateTraceId} from '@/shared/middleware/generate-trace-id';

describe('generateTraceId', () => {
  it('adds traceId to request', async () => {
    const app = express();
    app.use(generateTraceId);
    app.get('/', (req: any, res) => res.json({traceId: req.traceId}));
    const res = await request(app).get('/');
    expect(res.body.traceId).toBeDefined();
  });
});
