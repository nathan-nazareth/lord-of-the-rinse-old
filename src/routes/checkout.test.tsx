import { describe, it, expect } from 'vitest';
import { checkoutRoute } from './checkout';

describe('checkout route', () => {
  it('has meta title for the checkout page', () => {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router route types are complex generics
    const route = checkoutRoute as any;
    expect(typeof route.options.beforeLoad).toBe('function');
    route.options.beforeLoad();
    expect(document.title).toBe('Checkout');
  });

  it('has a beforeLoad hook', () => {
    expect(typeof checkoutRoute.options.beforeLoad).toBe('function');
  });
});
