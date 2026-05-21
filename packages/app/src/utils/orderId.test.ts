import { describe, expect, it } from 'vitest';
import { generateOrderId } from './orderId';

describe('generateOrderId', () => {
  it('generates a non-empty string', () => {
    const orderId = generateOrderId();
    expect(typeof orderId).toBe('string');
    expect(orderId.length).toBeGreaterThan(0);
  });

  it('generates unique IDs on successive calls', () => {
    const id1 = generateOrderId();
    const id2 = generateOrderId();
    expect(id1).not.toBe(id2);
  });

  it('starts with ORD prefix', () => {
    const orderId = generateOrderId();
    expect(orderId.startsWith('ORD-')).toBe(true);
  });

  it('contains only alphanumeric characters after prefix', () => {
    const orderId = generateOrderId();
    const suffix = orderId.slice(4);
    expect(/^[A-Z0-9]+$/.test(suffix)).toBe(true);
  });

  it('generates IDs between 8-12 characters total', () => {
    const orderId = generateOrderId();
    expect(orderId.length).toBeGreaterThanOrEqual(8);
    expect(orderId.length).toBeLessThanOrEqual(12);
  });
});
