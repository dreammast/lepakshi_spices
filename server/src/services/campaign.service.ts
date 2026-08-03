import { findAllCampaigns, findActiveCampaigns, findCampaignById, createCampaignRecord, updateCampaignRecord, deleteCampaignRecord } from '../repositories/campaign.repository.js';
import { AppError } from '../utils/app-error.js';
import { emitAdminAndPublic } from '../realtime/events.js';

export async function listCampaigns() { return findAllCampaigns(); }
export async function getActiveCampaigns() { return findActiveCampaigns(); }

export async function getCampaign(id: number) {
  const c = await findCampaignById(id);
  if (!c) throw new AppError(404, 'Campaign not found');
  return c;
}

export async function createCampaign(data: Parameters<typeof createCampaignRecord>[0]) {
  const created = await createCampaignRecord(data);
  emitAdminAndPublic('campaign.created', { campaignId: created, at: new Date() });
  return created;
}
export async function updateCampaign(id: number, data: Record<string, any>) {
  const updated = await updateCampaignRecord(id, data);
  emitAdminAndPublic('campaign.updated', { campaignId: id, at: new Date() });
  return updated;
}
export async function deleteCampaign(id: number) {
  await deleteCampaignRecord(id);
  emitAdminAndPublic('campaign.deleted', { campaignId: id, at: new Date() });
}
