import { describe, expect, it } from 'vitest';
import {
  attributeTypeSchema,
  attributeSchema,
  variantSchema,
  catalogResponseSchema,
} from './catalog';

describe('attributeTypeSchema', () => {
  it('accepts valid types', () => {
    for (const type of ['shape', 'scent', 'color', 'size', 'addon']) {
      expect(attributeTypeSchema.safeParse(type).success).toBe(true);
    }
  });

  it('rejects invalid type', () => {
    expect(attributeTypeSchema.safeParse('fragrance').success).toBe(false);
  });
});

describe('attributeSchema', () => {
  it('accepts valid attribute', () => {
    const result = attributeSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'scent',
      name: 'Lavender',
      slug: 'lavender',
      displayOrder: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe('variantSchema', () => {
  it('accepts valid variant', () => {
    const result = variantSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Lavender Dreams',
      slug: 'lavender-dreams',
      unitPrice: '12.99',
      attributes: [{
        attributeId: '660e8400-e29b-41d4-a716-446655440000',
        value: 'lavender',
      }],
    });
    expect(result.success).toBe(true);
  });
});

describe('catalogResponseSchema', () => {
  it('accepts valid response', () => {
    const result = catalogResponseSchema.safeParse({
      attributes: [],
      variants: [],
      settings: { shopOpen: true },
    });
    expect(result.success).toBe(true);
  });

  it('accepts populated response', () => {
    const result = catalogResponseSchema.safeParse({
      attributes: [{
        id: '550e8400-e29b-41d4-a716-446655440000',
        type: 'scent',
        name: 'Lavender',
        slug: 'lavender',
        displayOrder: 1,
      }],
      variants: [{
        id: '660e8400-e29b-41d4-a716-446655440000',
        name: 'Lavender Dreams',
        slug: 'lavender-dreams',
        unitPrice: '12.99',
        attributes: [],
      }],
      settings: {},
    });
    expect(result.success).toBe(true);
  });
});
