import { db } from '../config/database.js';
import { eq } from 'drizzle-orm';
import { getTable } from '../db/table-map.js';

export async function findAll(tableName: string) {
  const table = getTable(tableName);
  if (!table) throw new Error(`Table not found: ${tableName}`);
  return db.select().from(table);
}

export async function findById(tableName: string, id: number) {
  const table = getTable(tableName);
  if (!table) throw new Error(`Table not found: ${tableName}`);
  return db.select().from(table).where(eq(table.id, id));
}

export async function createRecord(tableName: string, data: Record<string, any>) {
  const table = getTable(tableName);
  if (!table) throw new Error(`Table not found: ${tableName}`);
  const [res] = await db.insert(table).values(data);
  return res.insertId;
}

export async function updateRecord(tableName: string, id: number, data: Record<string, any>) {
  const table = getTable(tableName);
  if (!table) throw new Error(`Table not found: ${tableName}`);
  await db.update(table).set(data).where(eq(table.id, id));
  return true;
}

export async function deleteRecord(tableName: string, id: number) {
  const table = getTable(tableName);
  if (!table) throw new Error(`Table not found: ${tableName}`);
  return db.delete(table).where(eq(table.id, id));
}
