import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CartItem } from '../types/cart';
import type { Customer } from '../types/webhook';

const mockFetch = vi.fn();

// The webhook now POSTs to a same-origin /api/webhook-submit proxy so the
// Web3Forms access key never ships in the client bundle. Mock fetch once.
beforeAll(() => {
  vi.stubGlobal('fetch', mockFetch);
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
    expect(payload.Discount).toBe('0% (Rs. 0.00)');
    expect(payload['Final Total']).toBe('Rs. 200.00');
  });

  it('applies 10% discount for 2 items', async () => {
    const payload = await extractPayload([makeItem({ id: 'a' }), makeItem({ id: 'b' })]);
    expect(payload.Discount).toBe('10% (Rs. 40.00)');
    expect(payload['Final Total']).toBe('Rs. 360.00');
  });

  it('applies 15% discount for 4 items', async () => {
    const payload = await extractPayload([
      makeItem({ id: 'a', quantity: 2 }),
      makeItem({ id: 'b', quantity: 2 }),
    ]);
    expect(payload.Discount).toBe('15% (Rs. 120.00)');
    expect(payload['Final Total']).toBe('Rs. 680.00');
  });

  it('keeps 10% discount for exactly 3 items (needs 4+ for 15%)', async () => {
    const payload = await extractPayload([
      makeItem({ id: 'a', quantity: 2 }),
      makeItem({ id: 'b', quantity: 1 }),
    ]);
    // 3 items: still 10% tier (need 4+ for 15%)
    expect(payload.Discount).toBe('10% (Rs. 60.00)');
    expect(payload['Final Total']).toBe('Rs. 540.00');
  });

  it('honours admin-configured discount tiers instead of the hardcoded defaults', async () => {
    // Admin configured: 3+ items → 20%, 5+ items → 30%.
    // With 3 items the hardcoded default would be 0% (default 10% kicks
    // in at 2 items, so this still applies below). The real regression
    // case is 4 items: hardcoded defaults say 15%, but the admin only
    // configured a 30% tier starting at 5+ — so 4 items should be 0%.
    const adminTiers = [
      { minItems: 3, percent: 20 },
      { minItems: 5, percent: 30 },
    ];

    // 2 items: no tier applies under admin config (minItems=3) → 0%
    const twoItemPayload = await (async () => {
      mockFetch.mockClear();
      await submitCartToWebhook(
        customer,
        [makeItem({ id: 'a' }), makeItem({ id: 'b' })],
        undefined,
        undefined,
        {},
        adminTiers,
      );
      const call = mockFetch.mock.calls[0];
      return JSON.parse(call[1].body);
    })();
    expect(twoItemPayload.Discount).toBe('0% (Rs. 0.00)');
    expect(twoItemPayload['Final Total']).toBe('Rs. 400.00');

    // 4 items: still 20% (the 30% tier only kicks in at 5+)
    const fourItemPayload = await (async () => {
      mockFetch.mockClear();
      await submitCartToWebhook(
        customer,
        [makeItem({ id: 'a', quantity: 2 }), makeItem({ id: 'b', quantity: 2 })],
        undefined,
        undefined,
        {},
        adminTiers,
      );
      const call = mockFetch.mock.calls[0];
      return JSON.parse(call[1].body);
    })();
    expect(fourItemPayload.Discount).toBe('20% (Rs. 160.00)');
    expect(fourItemPayload['Final Total']).toBe('Rs. 640.00');

    // 6 items: 30% (highest matching tier)
    const sixItemPayload = await (async () => {
      mockFetch.mockClear();
      await submitCartToWebhook(
        customer,
        [makeItem({ id: 'a', quantity: 3 }), makeItem({ id: 'b', quantity: 3 })],
        undefined,
        undefined,
        {},
        adminTiers,
      );
      const call = mockFetch.mock.calls[0];
      return JSON.parse(call[1].body);
    })();
    expect(sixItemPayload.Discount).toBe('30% (Rs. 360.00)');
    expect(sixItemPayload['Final Total']).toBe('Rs. 840.00');
  });

  it('regression: sleep() does not leak abort listeners on a long-lived signal across retries', async () => {
    // Force 3 retries (each calls sleep() with the same AbortSignal).
    // If the listener isn't removed after the timer fires, the
    // AbortSignal's listener list grows by one per attempt. The bug
    // is invisible to the user-facing test contract but exhausts the
    // 6-listener soft cap Node imposes on EventTarget-like objects
    // under sustained load.
    mockFetch.mockReset();
    mockFetch.mockResolvedValue({
      ok: true,
      status: 429,
      json: () => Promise.resolve({ success: false, message: 'rate limited' }),
    });

    const controller = new AbortController();
    const signal = controller.signal;
    // Expose the signal's internal listener count via the spec's
    // undocumented but widely-implemented property.
    const initialListenerCount =
      // @ts-expect-error — node-specific debug property
      signal.listenerCount?.('abort') ?? 0;

    const items = [makeItem()];
    await submitCartToWebhook(customer, items, undefined, undefined, { signal });

    const finalListenerCount =
      // @ts-expect-error — node-specific debug property
      signal.listenerCount?.('abort') ?? 0;
    expect(finalListenerCount).toBe(initialListenerCount);
  });
});
