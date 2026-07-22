import { eq, type InferModel } from 'drizzle-orm';
import { db } from '../config/database.js';
import { categories, productImages, productVariants, products } from '../db/schema.js';

export type ProductRecord = InferModel<typeof products>;
export type ProductVariantRecord = InferModel<typeof productVariants>;
export type ProductImageRecord = InferModel<typeof productImages>;

export async function findAllActiveProducts() {
  const productRows = await db
    .select({ product: products, category: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isActive, true));

  const allVariants = await db.select().from(productVariants);
  const allImages = await db.select().from(productImages);

  return productRows.map(row => {
    const p = row.product;
    const cat = row.category;
    const pVariants = allVariants.filter(v => v.productId === p.id);
    const pImages = allImages.filter(img => img.productId === p.id);
    const primaryImg = pImages.find(img => img.isPrimary) || pImages[0];
    const mainVariant = pVariants[0];

    const price = mainVariant ? Number(mainVariant.price) : Number(p.basePrice);
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
      stock,
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
  stock?: number;
  sku?: string;
  imageUrl?: string;
}) {
  let catId = data.categoryId || 1;
  if (!data.categoryId && data.categoryName) {
    const [existingCat] = await db.select().from(categories).where(eq(categories.name, data.categoryName));
    if (existingCat) {
      catId = existingCat.id;
    } else {
      const [newCat] = await db.insert(categories).values({
        name: data.categoryName,
        slug: data.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: new Date(),
        updatedAt: new Date()
      });
      catId = newCat.insertId;
    }
  }

  const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const priceVal = String(data.price || data.basePrice || 0);

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

  await db.insert(productVariants).values({
    productId,
    sku: data.sku || `SKU-${productId}`,
    price: priceVal,
    stock: data.stock !== undefined ? Number(data.stock) : 100,
    attributes: { pack: '100g' },
    createdAt: new Date(),
    updatedAt: new Date()
  });

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
  stock?: number;
  sku?: string;
  imageUrl?: string;
}) {
  const updateFields: Record<string, any> = { updatedAt: new Date() };
  if (data.name) updateFields.name = data.name;
  if (data.description !== undefined) updateFields.description = data.description;
  if (data.price !== undefined) updateFields.basePrice = String(data.price);
  if (data.categoryId) updateFields.categoryId = data.categoryId;

  if (Object.keys(updateFields).length > 1) {
    await db.update(products).set(updateFields).where(eq(products.id, id));
  }

  const [variant] = await db.select().from(productVariants).where(eq(productVariants.productId, id));
  if (variant) {
    const vFields: Record<string, any> = { updatedAt: new Date() };
    if (data.price !== undefined) vFields.price = String(data.price);
    if (data.stock !== undefined) vFields.stock = Number(data.stock);
    if (data.sku) vFields.sku = data.sku;
    await db.update(productVariants).set(vFields).where(eq(productVariants.id, variant.id));
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


