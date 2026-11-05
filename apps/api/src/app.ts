import { Hono } from 'hono';
import { APP_NAME, type HealthResponse } from '@listo/shared';

export const app = new Hono()
  .basePath('/api')
  .get('/health', (c) => c.json<HealthResponse>({ status: 'ok', app: APP_NAME }));

export type AppType = typeof app;
