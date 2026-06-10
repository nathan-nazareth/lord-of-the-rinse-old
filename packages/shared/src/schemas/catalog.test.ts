import { describe, expect, it } from 'vitest';
import {
  attributeTypeSchema,
  attributeSchema,
  attributeAdminSchema,
  createAttributeSchema,
  updateAttributeSchema,
  variantSchema,
  variantAdminSchema,
  createVariantSchema,
  updateVariantSchema,
  variantAttributeRefSchema,
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

describe('variantAttributeRefSchema', () => {
  it('accepts valid attribute reference', () => {
    const result = variantAttributeRefSchema.safeParse({
      attributeId: '660e8400-e29b-41d4-a716-446655440000',
      value: 'lavender',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty value', () => {
    const result = variantAttributeRefSchema.safeParse({
      attributeId: '660e8400-e29b-41d4-a716-446655440000',
      value: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid attributeId', () => {
    const result = variantAttributeRefSchema.safeParse({
      attributeId: 'not-a-uuid',
      value: 'lavender',
    });
    expect(result.success).toBe(false);
  });
});

describe('variantAdminSchema', () => {
  it('accepts valid admin variant', () => {
    const result = variantAdminSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Lavender Dreams',
      slug: 'lavender-dreams',
      unitPrice: '12.99',
      enabled: true,
      archived: false,
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
      attributes: [{
        attributeId: '660e8400-e29b-41d4-a716-446655440000',
        value: 'lavender',
      }],
    });
    expect(result.success).toBe(true);
  });
});

describe('createVariantSchema', () => {
  it('accepts valid create input', () => {
    const result = createVariantSchema.safeParse({
      name: 'Rose Petal',
      slug: 'rose-petal',
      unitPrice: '14.99',
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = createVariantSchema.safeParse({
      name: '',
      slug: 'test',
      unitPrice: '9.99',
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid slug', () => {
    const result = createVariantSchema.safeParse({
      name: 'Test',
      slug: 'NOT VALID',
      unitPrice: '9.99',
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid price', () => {
    const result = createVariantSchema.safeParse({
      name: 'Test',
      slug: 'test',
      unitPrice: 'free',
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty attributes', () => {
    const result = createVariantSchema.safeParse({
      name: 'Test',
      slug: 'test',
      unitPrice: '9.99',
      attributes: [],
    });
    expect(result.success).toBe(false);
  });

  it('rejects price with more than 2 decimals', () => {
    const result = createVariantSchema.safeParse({
      name: 'Test',
      slug: 'test',
      unitPrice: '9.999',
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(false);
  });
});

describe('updateVariantSchema', () => {
  it('accepts partial update', () => {
    const result = updateVariantSchema.safeParse({ name: 'New Name' });
    expect(result.success).toBe(true);
  });

  it('accepts enabled flag', () => {
    const result = updateVariantSchema.safeParse({ enabled: false });
    expect(result.success).toBe(true);
  });

  it('accepts archived flag', () => {
    const result = updateVariantSchema.safeParse({ archived: true });
    expect(result.success).toBe(true);
  });

  it('accepts attributes update', () => {
    const result = updateVariantSchema.safeParse({
      attributes: [{ attributeId: '660e8400-e29b-41d4-a716-446655440000', value: 'rose' }],
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty attributes array', () => {
    const result = updateVariantSchema.safeParse({ attributes: [] });
    expect(result.success).toBe(false);
  });

  it('accepts empty object', () => {
    const result = updateVariantSchema.safeParse({});
    expect(result.success).toBe(true);
  });
});

describe('catalogResponseSchema', () => {
  it('accepts valid response', () => {
    const result = catalogResponseSchema.safeParse({
      // attributes is a Record<AttributeType, Attribute[]> in the real wire
      // format — keep the schema test in lockstep with the route.
      attributes: {},
      variants: [],
      settings: { shopOpen: true },
    });
    expect(result.success).toBe(true);
  });

  it('accepts populated response', () => {
    const result = catalogResponseSchema.safeParse({
      attributes: {
        scent: [
          {
            id: '550e8400-e29b-41d4-a716-446655440000',
            type: 'scent',
            name: 'Lavender',
            slug: 'lavender',
            displayOrder: 1,
          },
        ],
      },
      variants: [
        {
          id: '660e8400-e29b-41d4-a716-446655440000',
          name: 'Lavender Dreams',
          slug: 'lavender-dreams',
          unitPrice: '12.99',
          attributes: [],
        },
      ],
      settings: {},
    });
    expect(result.success).toBe(true);
  });

  it('rejects an invalid attribute type key', () => {
    const result = catalogResponseSchema.safeParse({
      attributes: { fragrance: [] }, // not in the enum
      variants: [],
      settings: {},
    });
    expect(result.success).toBe(false);
  });
});
