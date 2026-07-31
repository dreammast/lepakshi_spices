import {
  findAllQuotations,
  findQuotationById,
  findQuotationsByInquiryId,
  findQuotationRevisions,
  createQuotationRecord,
  createQuotationRevision,
  updateQuotationRecord,
  updateQuotationStatus,
  deleteQuotation,
} from '../repositories/quotation.repository.js';
import { AppError } from '../../../utils/app-error.js';
import { listProducts } from '../../../services/product.service.js';
import { recordActivity } from './activity.service.js';
import type { CreateQuotationInput, CreateQuotationRevisionInput, UpdateQuotationInput } from '../types/index.js';

// ---------------------------------------------------------------------------
// Wholesale Quotation Service
// ---------------------------------------------------------------------------

export async function listQuotations() {
  return findAllQuotations();
}

export async function getQuotation(id: number) {
  const q = await findQuotationById(id);
  if (!q) throw new AppError(404, 'Quotation not found');
  return q;
}

export async function getQuotationWithRevisions(id: number) {
  const q = await getQuotation(id);
  const revisions = await findQuotationRevisions(id);
  return { ...q, revisions };
}

export async function getQuotationsForInquiry(inquiryId: number) {
  return findQuotationsByInquiryId(inquiryId);
}

export async function createQuotation(data: CreateQuotationInput) {
  const q = await createQuotationRecord(data);
  await recordActivity({
    entityType: 'quotation',
    entityId: q!.id,
    action: 'created',
    newValue: JSON.stringify({ totalAmount: data.totalAmount, itemCount: data.items?.length ?? 0 }),
  });
  return q;
}

export async function createRevision(parentId: number, data: CreateQuotationRevisionInput) {
  const parent = await findQuotationById(parentId);
  if (!parent) throw new AppError(404, 'Parent quotation not found');
  if (parent.status === 'converted') throw new AppError(400, 'Cannot revise a converted quotation');

  const revision = await createQuotationRevision(
    parentId,
    parent.inquiryId,
    parent.customerId,
    parent.revisionNumber,
    data,
  );

  await recordActivity({
    entityType: 'quotation',
    entityId: revision!.id,
    action: 'revision_created',
    previousValue: `revision ${parent.revisionNumber}`,
    newValue: `revision ${revision!.revisionNumber}`,
    notes: `Created from quotation #${parentId}`,
  });

  return revision;
}

export async function acceptQuotation(id: number, notes?: string) {
  const q = await findQuotationById(id);
  if (!q) throw new AppError(404, 'Quotation not found');
  if (q.status === 'accepted') return q;
  if (q.status === 'converted') throw new AppError(400, 'Quotation already converted to order');
  if (q.status === 'rejected' || q.status === 'expired') {
    throw new AppError(400, `Cannot accept a ${q.status} quotation`);
  }

  const updated = await updateQuotationStatus(id, 'accepted');

  await recordActivity({
    entityType: 'quotation',
    entityId: id,
    action: 'status_changed',
    previousValue: q.status,
    newValue: 'accepted',
    notes,
  });

  return updated;
}

export async function updateQuotation(id: number, data: UpdateQuotationInput) {
  const before = await findQuotationById(id);
  if (!before) throw new AppError(404, 'Quotation not found');
  const updated = await updateQuotationRecord(id, data as Record<string, any>);

  await recordActivity({
    entityType: 'quotation',
    entityId: id,
    action: 'updated',
    previousValue: JSON.stringify({ status: before.status, totalAmount: before.totalAmount }),
    newValue: JSON.stringify(data),
  });

  return updated;
}

export async function removeQuotation(id: number) {
  return deleteQuotation(id);
}

/**
 * Returns the product catalogue for wholesale customers.
 * Currently delegates to the shared product service.
 */
export async function listWholesaleCatalogueData() {
  return listProducts();
}
