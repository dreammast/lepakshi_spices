import {
  findAll,
  findById,
  createRecord,
  updateRecord,
  deleteRecord
} from '../repositories/generic.repository.js';

export async function listEntities(entityName: string) {
  return findAll(entityName);
}

export async function getEntity(entityName: string, id: number) {
  const rows = await findById(entityName, id);
  return rows[0] ?? null;
}

export async function createEntity(entityName: string, data: Record<string, any>) {
  return createRecord(entityName, data);
}

export async function updateEntity(entityName: string, id: number, data: Record<string, any>) {
  return updateRecord(entityName, id, data);
}

export async function deleteEntity(entityName: string, id: number) {
  return deleteRecord(entityName, id);
}
