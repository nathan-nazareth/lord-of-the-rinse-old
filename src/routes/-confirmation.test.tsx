import { describe, expect, it } from 'vitest';
import { Route as confirmationRouteImport } from './confirmation';

describe('confirmation route', () => {
  it('has meta title for the confirmation page', () => {
    // biome-ignore lint/suspicious/noExplicitAny: TanStack Router route types are complex generics
    const route = confirmationRouteImport as any;
    expect(typeof route.options.beforeLoad).toBe('function');
    route.options.beforeLoad();
    expect(document.title).toBe('Order Confirmed');
  });

  it('has a beforeLoad hook', () => {
    expect(typeof confirmationRouteImport.options.beforeLoad).toBe('function');
  });
});
