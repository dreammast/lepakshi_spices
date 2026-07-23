import type { Request, Response, NextFunction } from 'express';
import { listCampaigns, getActiveCampaigns, createCampaign, updateCampaign, deleteCampaign } from '../services/campaign.service.js';
import { sendSuccess, sendCreated } from '../utils/response.util.js';

export async function listCampaignsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await listCampaigns()); } catch (e) { next(e); }
}

export async function activeCampaignsController(_req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await getActiveCampaigns()); } catch (e) { next(e); }
}

export async function createCampaignController(req: Request, res: Response, next: NextFunction) {
  try { const id = await createCampaign(req.body); sendCreated(res, { id, ...req.body }); } catch (e) { next(e); }
}

export async function updateCampaignController(req: Request, res: Response, next: NextFunction) {
  try { sendSuccess(res, await updateCampaign(Number(req.params.id), req.body), 'Campaign updated'); } catch (e) { next(e); }
}

export async function deleteCampaignController(req: Request, res: Response, next: NextFunction) {
  try { await deleteCampaign(Number(req.params.id)); sendSuccess(res, { deleted: true }); } catch (e) { next(e); }
}
