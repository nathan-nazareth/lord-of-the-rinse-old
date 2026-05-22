import { describe, expect, it } from 'vitest';
import {
  checkoutItemSchema,
  checkoutRequestSchema,
  checkoutResponseSchema,
} from './checkout';

describe('checkoutItemSchema', () => {
  it('accepts valid item', () => {
    const result = checkoutItemSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 2,
      displayName: 'Lavender Dreams',
      unitPrice: '12.99',
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative quantity', () => {
    const result = checkoutItemSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: -1,
      displayName: 'Lavender Dreams',
      unitPrice: '12.99',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty displayName', () => {
    const result = checkoutItemSchema.safeParse({
      variantId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 1,
      displayName: '',
      unitPrice: '12.99',
    });
    expect(result.success).toBe(false);
  });
});

describe('checkoutRequestSchema', () => {
  it('accepts valid request', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [{
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 2,
        displayName: 'Lavender Dreams',
        unitPrice: '12.99',
      }],
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty items array', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [],
      customerName: 'John Doe',
      customerEmail: 'john@example.com',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = checkoutRequestSchema.safeParse({
      items: [{
        variantId: '550e8400-e29b-41d4-a716-446655440000',
        quantity: 1,
        displayName: 'Lavender Dreams',
        unitPrice: '12.99',
      }],
      customerName: 'John Doe',
      customerEmail: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('checkoutResponseSchema', () => {
  it('accepts valid response', () => {
    const result = checkoutResponseSchema.safeParse({
      orderReference: 'LOR-20260522-0001',
      total: '25.98',
    });
    expect(result.success).toBe(true);
  });
});
