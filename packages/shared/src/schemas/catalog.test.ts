import { describe, expect, it } from 'vitest';
import {
  attributeTypeSchema,
  attributeSchema,
  attributeAdminSchema,
  createAttributeSchema,
  updateAttributeSchema,
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

describe('attributeAdminSchema', () => {
  it('accepts valid admin attribute with archived and timestamps', () => {
    const result = attributeAdminSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      type: 'scent',
      name: 'Lavender',
      slug: 'lavender',
      displayOrder: 1,
      archived: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });
});

describe('createAttributeSchema', () => {
  it('accepts valid create input', () => {
    const result = createAttributeSchema.safeParse({
      type: 'scent',
      name: 'Lavender',
      slug: 'lavender',
    });
    expect(result.success).toBe(true);
  });

  it('defaults displayOrder to 0', () => {
    const result = createAttributeSchema.safeParse({
      type: 'shape',
      name: 'Round',
      slug: 'round',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayOrder).toBe(0);
    }
  });

  it('rejects empty name', () => {
    const result = createAttributeSchema.safeParse({
      type: 'scent',
      name: '',
      slug: 'lavender',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug with spaces', () => {
    const result = createAttributeSchema.safeParse({
      type: 'scent',
      name: 'Lavender',
      slug: 'not valid',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug with uppercase', () => {
    const result = createAttributeSchema.safeParse({
      type: 'scent',
      name: 'Lavender',
      slug: 'Lavender',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid type', () => {
    const result = createAttributeSchema.safeParse({
      type: 'fragrance',
      name: 'Rose',
      slug: 'rose',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateAttributeSchema', () => {
  it('accepts partial update', () => {
    const result = updateAttributeSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts archived flag', () => {
    const result = updateAttributeSchema.safeParse({ archived: true });
    expect(result.success).toBe(true);
  });

  it('accepts empty object', () => {
    const result = updateAttributeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('rejects invalid slug', () => {
    const result = updateAttributeSchema.safeParse({ slug: 'NOT VALID' });
    expect(result.success).toBe(false);
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
