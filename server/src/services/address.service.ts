import {
  createAddressRecord,
  deleteAddressRecord,
  findAddressesByCustomerId,
  updateAddressRecord
} from '../repositories/address.repository.js';
import { AppError } from '../utils/app-error.js';

export async function listAddresses(customerId: number) {
  return findAddressesByCustomerId(customerId);
}

export async function addAddress(customerId: number, data: Parameters<typeof createAddressRecord>[1]) {
  return createAddressRecord(customerId, data);
}

export async function editAddress(customerId: number, id: number, data: Parameters<typeof updateAddressRecord>[2]) {
  const updated = await updateAddressRecord(customerId, id, data);
  if (!updated) {
    throw new AppError(404, 'Address not found');
  }
  return updated;
}

export async function removeAddress(customerId: number, id: number) {
  await deleteAddressRecord(customerId, id);
}
