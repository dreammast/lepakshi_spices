import { findAllCampaigns, findActiveCampaigns, findCampaignById, createCampaignRecord, updateCampaignRecord, deleteCampaignRecord } from '../repositories/campaign.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listCampaigns() { return findAllCampaigns(); }
export async function getActiveCampaigns() { return findActiveCampaigns(); }

export async function getCampaign(id: number) {
  const c = await findCampaignById(id);
  if (!c) throw new AppError(404, 'Campaign not found');
  return c;
}

export async function createCampaign(data: Parameters<typeof createCampaignRecord>[0]) { return createCampaignRecord(data); }
export async function updateCampaign(id: number, data: Record<string, any>) { return updateCampaignRecord(id, data); }
export async function deleteCampaign(id: number) { return deleteCampaignRecord(id); }
