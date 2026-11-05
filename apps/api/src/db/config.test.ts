import { describe, expect, it } from 'vitest';
import { readDatabaseUrl } from './config.ts';

const VALID_URL = 'postgres://listo:secret@localhost:5433/listo';

describe('readDatabaseUrl', () => {
  it('returns DATABASE_URL when it is a postgres url', () => {
    expect(readDatabaseUrl({ DATABASE_URL: VALID_URL })).toBe(VALID_URL);
  });

  it('accepts the postgresql:// scheme', () => {
    const url = 'postgresql://listo:secret@localhost:5433/listo';

    expect(readDatabaseUrl({ DATABASE_URL: url })).toBe(url);
  });

  it('throws when DATABASE_URL is missing', () => {
    expect(() => readDatabaseUrl({})).toThrow(/DATABASE_URL is not set/);
  });

  it('throws when DATABASE_URL is blank', () => {
    expect(() => readDatabaseUrl({ DATABASE_URL: '  ' })).toThrow(/DATABASE_URL is not set/);
  });

  it('throws when DATABASE_URL is not a valid url', () => {
    expect(() => readDatabaseUrl({ DATABASE_URL: 'not a url' })).toThrow(
      /DATABASE_URL is not a valid URL/,
    );
  });

  it('throws when DATABASE_URL uses a non-postgres scheme', () => {
    expect(() => readDatabaseUrl({ DATABASE_URL: 'mysql://root@localhost/listo' })).toThrow(
      /DATABASE_URL must use the postgres:\/\/ or postgresql:\/\/ scheme/,
    );
  });

  it('never echoes the url in error messages, since it may hold a password', () => {
    const leaky = 'mysql://listo:super-secret@localhost/listo';

    let message = '';
    try {
      readDatabaseUrl({ DATABASE_URL: leaky });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }

    expect(message).not.toBe('');
    expect(message).not.toContain('super-secret');
  });
});
