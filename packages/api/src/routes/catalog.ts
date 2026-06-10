import { db } from '@lotr/db';
import {
  catalogAttributes,
  commerceSettings,
  soapVariants,
  variantAttributes,
} from '@lotr/db/schema';
import type { AttributeType, CatalogAttribute, SoapVariant } from '@lotr/shared';
import { and, asc, eq, inArray } from 'drizzle-orm';
import { Hono } from 'hono';

const PUBLIC_SETTINGS = new Set(['shop_open', 'currency', 'discount_tiers']);

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
    const group = grouped[attr.type as AttributeType] || [];
    group.push(attr);
    grouped[attr.type as AttributeType] = group;
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
    ...v,
    attributes: attrsByVariant.get(v.id) || [],
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
