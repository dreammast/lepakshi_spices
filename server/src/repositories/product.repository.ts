import { eq, type InferModel } from 'drizzle-orm';
import { db } from '../config/database.js';
import { bulkPackaging, categories, productImages, productVariants, products } from '../db/schema.js';

export type ProductRecord = InferModel<typeof products>;
export type ProductVariantRecord = InferModel<typeof productVariants>;
export type ProductImageRecord = InferModel<typeof productImages>;

type ProductPrices = {
  p100?: string | number;
  p250?: string | number;
  p500?: string | number;
  p1000?: string | number;
};

const PRICE_VARIANTS = [
  { key: 'p100', label: '100g', weightGrams: 100, suffix: '100G', isDefault: true },
  { key: 'p250', label: '250g', weightGrams: 250, suffix: '250G', isDefault: false },
  { key: 'p500', label: '500g', weightGrams: 500, suffix: '500G', isDefault: false },
  { key: 'p1000', label: '1000g', weightGrams: 1000, suffix: '1KG', isDefault: false },
] as const;

// Every product has the same supported retail and wholesale pack choices.
// Prices remain editable in admin through the variants/packaging endpoints.
const WHOLESALE_PACKS = [
  { label: '5kg', multiplier: 5 },
  { label: '10kg', multiplier: 10 },
  { label: '15kg', multiplier: 15 },
  { label: '25kg', multiplier: 25 },
] as const;

function toNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function buildPriceMap(basePrice: unknown, prices?: ProductPrices) {
  const base = toNumber(basePrice);
  return {
    p100: toNumber(prices?.p100, Math.round(base * 0.6)),
    p250: toNumber(prices?.p250, Math.round(base * 1.3)),
    p500: toNumber(prices?.p500, Math.round(base * 2.4)),
    p1000: toNumber(prices?.p1000, base),
  };
}

async function resolveCategoryId(data: { categoryId?: number; categoryName?: string }) {
  if (data.categoryId) return data.categoryId;
  if (!data.categoryName) return 1;

  const [existingCat] = await db.select().from(categories).where(eq(categories.name, data.categoryName));
  if (existingCat) return existingCat.id;

  const [newCat] = await db.insert(categories).values({
    name: data.categoryName,
    slug: data.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    createdAt: new Date(),
    updatedAt: new Date()
  });
  return newCat.insertId;
}

export async function findAllActiveProducts() {
  const productRows = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true));

  const allVariants = await db.select().from(productVariants);
  const allImages = await db.select().from(productImages);
  const allPackaging = await db.select().from(bulkPackaging).where(eq(bulkPackaging.isActive, true));

  return productRows.map(row => {
    const p = row.product;
    const cat = row.category;
    const pVariants = allVariants
      .filter(v => v.productId === p.id)
      .sort((a, b) => (a.weightGrams || 999999) - (b.weightGrams || 999999));
    const pImages = allImages.filter(img => img.productId === p.id);
    const primaryImg = pImages.find(img => img.isPrimary) || pImages[0];
    const mainVariant = pVariants.find(v => v.isDefault) || pVariants.find(v => v.weightGrams === 100) || pVariants[0];

    const priceByWeight = Object.fromEntries(pVariants.map(v => [v.weightGrams, Number(v.price)]));
    const prices = buildPriceMap(p.basePrice, {
      p100: priceByWeight[100],
      p250: priceByWeight[250],
      p500: priceByWeight[500],
      p1000: priceByWeight[1000],
    });
    const price = prices.p100;
    const stock = mainVariant ? mainVariant.stock : 100;
    const sku = mainVariant ? mainVariant.sku : `SPH-${p.id}`;
    const imageUrl = primaryImg ? primaryImg.url : "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&fit=crop";

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      category: cat ? cat.name : "Spice Blends",
      categoryId: p.categoryId,
      price,
      basePrice: Number(p.basePrice),
      prices,
      variants: pVariants.map(v => ({
        id: v.id,
        sku: v.sku,
        label: v.label,
        weightGrams: v.weightGrams,
        price: Number(v.price),
        stock: v.stock,
        lowStockThreshold: v.lowStockThreshold,
        isDefault: v.isDefault,
        attributes: v.attributes,
      })),
      packaging: (allPackaging.filter(pack => pack.productId === p.id).map(pack => ({
        id: pack.id,
        label: pack.packLabel,
        price: Number(pack.price),
        minOrderQty: pack.minOrderQty,
      })) || []).length ? allPackaging.filter(pack => pack.productId === p.id).map(pack => ({
        id: pack.id,
        label: pack.packLabel,
        price: Number(pack.price),
        minOrderQty: pack.minOrderQty,
      })) : WHOLESALE_PACKS.map(pack => ({
        id: undefined,
        label: pack.label,
        price: prices.p1000 * pack.multiplier,
        minOrderQty: 1,
      })),
      stock,
      lowStockThreshold: mainVariant ? mainVariant.lowStockThreshold : 30,
      sold: 12,
      rating: 4.9,
      status: p.isActive ? (stock > 0 ? "active" : "out-of-stock") : "out-of-stock",
      sku,
      origin: "India",
      description: p.description || "",
      imageUrl,
      image: imageUrl,
      subtitle: cat ? cat.name : "Single Origin",
      weight: "100g",
      inStock: stock > 0,
      badge: "Bestseller",
      tags: ["organic", "premium"],
    };
  });
}

export async function findProductBySlug(slug: string) {
  const [product] = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug));

  if (!product) return null;

  const p = product.product;
  const pVariants = await db.select().from(productVariants).where(eq(productVariants.productId, p.id));
  const pImages = await db.select().from(productImages).where(eq(productImages.productId, p.id));

  return {
    product: p,
    category: product.category,
    variants: pVariants,
    images: pImages
  };
}

export async function findProductVariantsByProductId(productId: number) {
  return db.select().from(productVariants).where(eq(productVariants.productId, productId));
}

export async function findProductImagesByProductId(productId: number) {
  return db.select().from(productImages).where(eq(productImages.productId, productId));
}

export async function createProductRecord(data: {
  categoryId?: number;
  categoryName?: string;
  name: string;
  slug?: string;
  description?: string;
  basePrice?: string | number;
  price?: string | number;
  prices?: ProductPrices;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  imageUrl?: string;
}) {
  const catId = await resolveCategoryId(data);

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const basePrice = data.price ?? data.basePrice ?? data.prices?.p1000 ?? 0;
  const priceVal = String(basePrice);
  const prices = buildPriceMap(basePrice, data.prices);

  const [res] = await db.insert(products).values({
    categoryId: catId,
    name: data.name,
    slug,
    description: data.description || '',
    basePrice: priceVal,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  const productId = res.insertId;
  const baseSku = data.sku || `SKU-${productId}`;
  const stock = data.stock !== undefined ? Number(data.stock) : 100;
  const lowStockThreshold = data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 30;

  await db.insert(productVariants).values(PRICE_VARIANTS.map(variant => ({
    productId,
    sku: variant.isDefault ? baseSku : `${baseSku}-${variant.suffix}`,
    label: variant.label,
    weightGrams: variant.weightGrams,
    price: String(prices[variant.key]),
    stock,
    lowStockThreshold,
    isDefault: variant.isDefault,
    attributes: { pack: variant.label },
    createdAt: new Date(),
    updatedAt: new Date()
  })));

  await db.insert(bulkPackaging).values(WHOLESALE_PACKS.map(pack => ({
    productId,
    packLabel: pack.label,
    price: String(prices.p1000 * pack.multiplier),
    minOrderQty: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  })));

  if (data.imageUrl) {
    await db.insert(productImages).values({
      productId,
      url: data.imageUrl,
      altText: data.name,
      isPrimary: true,
      createdAt: new Date()
    });
  }

  return productId;
}

export async function updateProductRecord(id: number, data: {
  categoryId?: number;
  categoryName?: string;
  name?: string;
  description?: string;
  price?: string | number;
  prices?: ProductPrices;
  stock?: number;
  lowStockThreshold?: number;
  sku?: string;
  imageUrl?: string;
}) {
  if (!data.categoryId && data.categoryName) {
    data.categoryId = await resolveCategoryId(data);
  }

  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (data.name) updateFields.name = data.name;
  if (data.description !== undefined) updateFields.description = data.description;
  const basePrice = data.price ?? data.prices?.p1000;
  if (basePrice !== undefined) updateFields.basePrice = String(basePrice);
  if (data.categoryId) updateFields.categoryId = data.categoryId;

  if (Object.keys(updateFields).length > 1) {
    await db.update(products).set(updateFields).where(eq(products.id, id));
  }

  const existingVariants = await db.select().from(productVariants).where(eq(productVariants.productId, id));
  const existingPrices = Object.fromEntries(existingVariants.map(v => [v.weightGrams, Number(v.price)]));
  const prices = buildPriceMap(basePrice ?? updateFields.basePrice ?? 0, {
    p100: data.prices?.p100 ?? existingPrices[100],
    p250: data.prices?.p250 ?? existingPrices[250],
    p500: data.prices?.p500 ?? existingPrices[500],
    p1000: data.prices?.p1000 ?? existingPrices[1000] ?? updateFields.basePrice,
  });
  const baseSku = data.sku || existingVariants.find(v => v.isDefault)?.sku || existingVariants[0]?.sku || `SKU-${id}`;

  for (const variant of PRICE_VARIANTS) {
    const existing = existingVariants.find(v => v.weightGrams === variant.weightGrams)
      || (variant.isDefault ? existingVariants.find(v => !v.weightGrams) || existingVariants[0] : undefined);

    const variantFields: Record<string, any> = {
      label: variant.label,
      weightGrams: variant.weightGrams,
      price: String(prices[variant.key]),
      isDefault: variant.isDefault,
      attributes: { pack: variant.label },
      updatedAt: new Date()
    };
    if (data.stock !== undefined) variantFields.stock = Number(data.stock);
    if (data.lowStockThreshold !== undefined) variantFields.lowStockThreshold = Number(data.lowStockThreshold);
    if (data.sku) variantFields.sku = variant.isDefault ? data.sku : `${data.sku}-${variant.suffix}`;

    if (existing) {
      await db.update(productVariants).set(variantFields).where(eq(productVariants.id, existing.id));
    } else {
      await db.insert(productVariants).values({
        productId: id,
        sku: variant.isDefault ? baseSku : `${baseSku}-${variant.suffix}`,
        label: variant.label,
        weightGrams: variant.weightGrams,
        price: String(prices[variant.key]),
        stock: data.stock !== undefined ? Number(data.stock) : 100,
        lowStockThreshold: data.lowStockThreshold !== undefined ? Number(data.lowStockThreshold) : 30,
        isDefault: variant.isDefault,
        attributes: { pack: variant.label },
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  if (data.imageUrl) {
    const [img] = await db.select().from(productImages).where(eq(productImages.productId, id));
    if (img) {
      await db.update(productImages).set({ url: data.imageUrl }).where(eq(productImages.id, img.id));
    } else {
      await db.insert(productImages).values({
        productId: id,
        url: data.imageUrl,
        altText: data.name || 'Product',
        isPrimary: true,
        createdAt: new Date()
      });
    }
  }
  return true;
}

export async function deleteProductRecord(id: number) {
  await db.delete(productVariants).where(eq(productVariants.productId, id));
  await db.delete(productImages).where(eq(productImages.productId, id));
  return db.delete(products).where(eq(products.id, id));
}


