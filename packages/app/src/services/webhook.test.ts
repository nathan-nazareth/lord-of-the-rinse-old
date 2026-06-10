import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../types/cart';
import type { Customer } from '../types/webhook';

const mockFetch = vi.fn();

// Set env before any module loads (Vite replaces import.meta.env at build time)
beforeAll(() => {
  vi.stubGlobal('fetch', mockFetch);
  // Vitest merges env with process.env and replaces import.meta.env
  vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'test-key-123');
  vi.stubEnv('VITE_WEB3FORMS_ENDPOINT', 'https://api.test.com/submit');
});

// Dynamic import after env is stubbed
let submitCartToWebhook: typeof import('./webhook')['submitCartToWebhook'];

beforeAll(async () => {
  const mod = await import('./webhook');
  submitCartToWebhook = mod.submitCartToWebhook;
});

describe('submitCartToWebhook discount logic', () => {
  const customer: Customer = {
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
  };

  beforeEach(() => {
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
  });

  async function extractPayload(
    items: CartItem[],
  ): Promise<Record<string, string | number | undefined>> {
    await submitCartToWebhook(customer, items);
    // First call is the Web3Forms submission; a second call to /api/orders may follow on success.
    const call = mockFetch.mock.calls[0];
    expect(call).toBeDefined();
    const body = JSON.parse(call[1].body);
    return body;
  }

  function makeItem(overrides: Partial<CartItem> = {}): CartItem {
    return {
      id: 'test-id',
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      shape: 'round',
      scent: 'lavender',
      color: 'blue',
      size: '100g',
      quantity: 1,
      price: 200,
      hasLavenderPieces: false,
      addedAt: new Date().toISOString(),
      ...overrides,
    };
  }

  it('applies 0% discount for a single item', async () => {
    const payload = await extractPayload([makeItem()]);
    expect(payload.Discount).toBe('0% (Rs. 0)');
    expect(payload['Final Total']).toBe('Rs. 200');
  });

  it('applies 10% discount for 2 items', async () => {
    const payload = await extractPayload([makeItem({ id: 'a' }), makeItem({ id: 'b' })]);
    expect(payload.Discount).toBe('10% (Rs. 40)');
    expect(payload['Final Total']).toBe('Rs. 360');
  });

  it('applies 15% discount for 4 items', async () => {
    const payload = await extractPayload([
      makeItem({ id: 'a', quantity: 2 }),
      makeItem({ id: 'b', quantity: 2 }),
    ]);
    expect(payload.Discount).toBe('15% (Rs. 120)');
    expect(payload['Final Total']).toBe('Rs. 680');
  });

  it('keeps 10% discount for exactly 3 items (needs 4+ for 15%)', async () => {
    const payload = await extractPayload([
      makeItem({ id: 'a', quantity: 2 }),
      makeItem({ id: 'b', quantity: 1 }),
    ]);
    // 3 items: still 10% tier (need 4+ for 15%)
    expect(payload.Discount).toBe('10% (Rs. 60)');
    expect(payload['Final Total']).toBe('Rs. 540');
  });
});
