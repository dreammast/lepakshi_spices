import { eq, desc } from 'drizzle-orm';
import { db } from '../config/database.js';
import { recipes } from '../db/schema.js';

export async function findAllRecipes() {
  return db.select().from(recipes).orderBy(desc(recipes.createdAt));
}

export async function findPublishedRecipes() {
  return db.select().from(recipes).where(eq(recipes.status, 'published')).orderBy(desc(recipes.createdAt));
}

export async function findRecipeBySlug(slug: string) {
  const [recipe] = await db.select().from(recipes).where(eq(recipes.slug, slug));
  return recipe ?? null;
}

export async function findRecipeById(id: number) {
  const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
  return recipe ?? null;
}

export async function createRecipeRecord(data: {
  title: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  prepMinutes?: number;
  cookMinutes?: number;
  servings?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  status?: 'draft' | 'published' | 'archived';
}) {
  const now = new Date();
  const [res] = await db.insert(recipes).values({
    title: data.title,
    slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: data.description,
    imageUrl: data.imageUrl,
    prepMinutes: data.prepMinutes,
    cookMinutes: data.cookMinutes,
    servings: data.servings,
    difficulty: data.difficulty,
    status: data.status ?? 'draft',
    publishedAt: data.status === 'published' ? now : undefined,
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateRecipeRecord(id: number, data: Record<string, any>) {
  const { id: _, createdAt: __, ...rest } = data;
  if (rest.status === 'published' && !rest.publishedAt) rest.publishedAt = new Date();
  await db.update(recipes).set({ ...rest, updatedAt: new Date() }).where(eq(recipes.id, id));
  return findRecipeById(id);
}

export async function deleteRecipeRecord(id: number) {
  return db.delete(recipes).where(eq(recipes.id, id));
}
