import { findSettingByKey, upsertSetting } from '../repositories/settings.repository.js';

export async function getSetting(key: string) {
  const setting = await findSettingByKey(key);
  if (!setting) return null;
  try { return { ...setting, value: JSON.parse(setting.value) }; } catch { return setting; }
}

export async function setSetting(key: string, value: unknown) {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value);
  return upsertSetting(key, serialized);
}
