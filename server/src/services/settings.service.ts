import { findSettingByKey, upsertSetting } from '../repositories/settings.repository.js';
import { emitAdminAndPublic } from '../realtime/events.js';

export async function getSetting(key: string) {
  const setting = await findSettingByKey(key);
  if (!setting) return null;
  try { return { ...setting, value: JSON.parse(setting.value) }; } catch { return setting; }
}

export async function setSetting(key: string, value: unknown) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  const updated = await upsertSetting(key, serialized);
  emitAdminAndPublic('settings.updated', { key, at: new Date() });
  return updated;
}
