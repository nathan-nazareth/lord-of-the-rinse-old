import { app } from '../index';
import { describe, expect, it } from 'vitest';

describe('GET /health', () => {
  it('returns ok status', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });

  it('returns ok status via /api/health', async () => {
    const res = await app.request('/api/health');
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body).toEqual({ status: 'ok' });
  });
});
