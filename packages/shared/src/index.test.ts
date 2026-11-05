import { describe, expect, it } from 'vitest';
import { APP_NAME } from './index.ts';

describe('APP_NAME', () => {
  it('is the name the API reports in health responses', () => {
    expect(APP_NAME).toBe('Listo');
  });
});
