import { eq, desc, and } from 'drizzle-orm';
import { db } from '../config/database.js';
import { campaigns } from '../db/schema.js';

export async function findAllCampaigns() {
  return db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
}

export async function findActiveCampaigns() {
  const now = new Date();
  const all = await db.select().from(campaigns).where(eq(campaigns.isActive, true));
  return all.filter(c => {
    if (c.startsAt && c.startsAt > now) return false;
    if (c.endsAt && c.endsAt < now) return false;
    return true;
  });
}

export async function findCampaignById(id: number) {
  const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
  return campaign ?? null;
}

export async function createCampaignRecord(data: {
  placement: 'alert_banner' | 'popup_modal';
  title?: string;
  message: string;
  ctaLabel?: string;
  ctaUrl?: string;
  imageUrl?: string;
  isActive?: boolean;
  startsAt?: Date | string;
  endsAt?: Date | string;
}) {
  const now = new Date();
  const [res] = await db.insert(campaigns).values({
    placement: data.placement,
    title: data.title,
    message: data.message,
    ctaLabel: data.ctaLabel,
    ctaUrl: data.ctaUrl,
    imageUrl: data.imageUrl,
    isActive: data.isActive ?? false,
    startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
    endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
    createdAt: now,
    updatedAt: now
  });
  return res.insertId;
}

export async function updateCampaignRecord(id: number, data: Record<string, any>) {
  const { id: _, createdAt: __, ...rest } = data;
  if (rest.startsAt) rest.startsAt = new Date(rest.startsAt);
  if (rest.endsAt) rest.endsAt = new Date(rest.endsAt);
  await db.update(campaigns).set({ ...rest, updatedAt: new Date() }).where(eq(campaigns.id, id));
  return findCampaignById(id);
}

export async function deleteCampaignRecord(id: number) {
  return db.delete(campaigns).where(eq(campaigns.id, id));
}
