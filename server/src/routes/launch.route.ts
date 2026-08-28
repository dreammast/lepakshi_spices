import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { asyncHandler } from '../middleware/async-handler.js';
import { authenticate, optionalAuthenticate, requireRole, type AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { sendSuccess } from '../utils/response.util.js';

const router = Router();

async function getSettings() {
  await db.execute(sql.raw(`INSERT IGNORE INTO launch_settings (is_enabled, has_launched, created_at, updated_at) VALUES (TRUE, FALSE, NOW(), NOW())`));
  const [rows] = await db.execute(sql.raw(`SELECT id, is_enabled, has_launched, launched_at, launched_by FROM launch_settings ORDER BY id ASC LIMIT 1`)) as any;
  return rows[0];
}

router.get('/status', optionalAuthenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const settings = await getSettings();
  const isAdmin = ['admin', 'manager'].includes(req.user?.role || '');
  sendSuccess(res, {
    isEnabled: Boolean(settings.is_enabled),
    hasLaunched: Boolean(settings.has_launched),
    launchedAt: settings.launched_at || null,
    launchedBy: settings.launched_by || null,
    shouldShowLaunch: isAdmin && Boolean(settings.is_enabled) && !Boolean(settings.has_launched),
    isAdmin,
  });
}));

router.post('/complete', authenticate, requireRole('admin', 'manager'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const settings = await getSettings();
  if (!settings.has_launched) {
    await db.execute(sql.raw(`UPDATE launch_settings SET has_launched = TRUE, launched_at = NOW(), launched_by = ${Number(req.user!.sub)}, updated_at = NOW() WHERE id = ${Number(settings.id)}`));
  }
  sendSuccess(res, { message: 'Launch completed' });
}));

router.post('/reset', authenticate, requireRole('admin', 'manager'), asyncHandler(async (_req, res) => {
  const settings = await getSettings();
  await db.execute(sql.raw(`UPDATE launch_settings SET has_launched = FALSE, launched_at = NULL, launched_by = NULL, updated_at = NOW() WHERE id = ${Number(settings.id)}`));
  sendSuccess(res, { message: 'Launch reset' });
}));

export default router;
