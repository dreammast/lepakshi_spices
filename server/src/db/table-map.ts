import * as schema from './schema.js';

export const tableMap = Object.fromEntries(Object.entries(schema)) as Record<string, any>;
export const tableNames = Object.keys(tableMap);

export function getTable(name: string) {
  return tableMap[name] ?? null;
}
