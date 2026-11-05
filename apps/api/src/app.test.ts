import { describe, expect, it } from 'vitest';
import { APP_NAME } from '@listo/shared';
import { app } from './app.ts';

describe('GET /api/health', () => {
  it('returns ok status with the app name', async () => {
    const res = await app.request('/api/health');

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'ok', app: APP_NAME });
  });

  it('returns 404 for unknown routes', async () => {
    const res = await app.request('/api/unknown');

    expect(res.status).toBe(404);
  });
});
