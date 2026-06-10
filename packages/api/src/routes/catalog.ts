import { db } from '@lotr/db';
import {
  catalogAttributes,
  commerceSettings,
  soapVariants,
  variantAttributes,
} from '@lotr/db/schema';
import { attributeTypeSchema, type AttributeType, type CatalogAttribute, type SoapVariant } from '@lotr/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';

const PUBLIC_SETTINGS = new Set(['shop_open', 'currency', 'discount_tiers']);

function isAttributeType(value: string): value is AttributeType {
  return attributeTypeSchema.safeParse(value).success;
}

const catalog = new Hono();

catalog.get('/', async (c) => {
  // Fetch non-archived attributes, ordered by displayOrder
  const attributes = await db
    .select()
    .from(catalogAttributes)
    .where(eq(catalogAttributes.archived, false))
    .orderBy(asc(catalogAttributes.displayOrder), asc(catalogAttributes.name));

  // Group attributes by type
  const grouped: Partial<Record<AttributeType, CatalogAttribute[]>> = {};
  for (const attr of attributes) {
    if (!isAttributeType(attr.type)) continue;
    const group = grouped[attr.type] || [];
    group.push({
      id: attr.id,
      type: attr.type,
      name: attr.name,
      slug: attr.slug,
      displayOrder: attr.displayOrder ?? 0,
      archived: attr.archived,
      createdAt:
        attr.createdAt instanceof Date
          ? attr.createdAt.toISOString()
          : typeof attr.createdAt === 'string'
            ? attr.createdAt
            : new Date().toISOString(),
      updatedAt:
        attr.updatedAt instanceof Date
          ? attr.updatedAt.toISOString()
          : typeof attr.updatedAt === 'string'
            ? attr.updatedAt
            : new Date().toISOString(),
    });
    grouped[attr.type] = group;
  }

  // Fetch enabled, non-archived variants
  const variants = await db
    .select()
    .from(soapVariants)
    .where(and(eq(soapVariants.enabled, true), eq(soapVariants.archived, false)))
    .orderBy(asc(soapVariants.name));

  // Fetch variant-attribute links for the returned variants
  const variantIds = variants.map((v) => v.id);
  const variantAttrs =
    variantIds.length > 0
      ? await db
          .select()
          .from(variantAttributes)
          .where(inArray(variantAttributes.variantId, variantIds))
      : [];

  // Group attributes by variant
  const attrsByVariant = new Map<string, { attributeId: string; value: string }[]>();
  for (const va of variantAttrs) {
    const list = attrsByVariant.get(va.variantId) || [];
    list.push({ attributeId: va.attributeId, value: va.value });
    attrsByVariant.set(va.variantId, list);
  }

  const variantsResult: SoapVariant[] = variants.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    unitPrice: v.unitPrice,
    enabled: v.enabled,
    archived: v.archived,
    attributes: attrsByVariant.get(v.id) || [],
    createdAt:
      v.createdAt instanceof Date
        ? v.createdAt.toISOString()
        : typeof v.createdAt === 'string'
          ? v.createdAt
          : new Date().toISOString(),
    updatedAt:
      v.updatedAt instanceof Date
        ? v.updatedAt.toISOString()
        : typeof v.updatedAt === 'string'
          ? v.updatedAt
          : new Date().toISOString(),
  }));

  // Fetch public settings only
  const settingKeys = Array.from(PUBLIC_SETTINGS);
  const settingsRows = await db
    .select({ key: commerceSettings.key, value: commerceSettings.value })
    .from(commerceSettings)
    .where(inArray(commerceSettings.key, settingKeys));

  const settings: Record<string, unknown> = {};
  for (const row of settingsRows) {
    try {
      settings[row.key] = JSON.parse(row.value);
    } catch {
      settings[row.key] = row.value;
    }
  }

  return c.json({
    attributes: grouped,
    variants: variantsResult,
    settings,
  });
});

export default catalog;
