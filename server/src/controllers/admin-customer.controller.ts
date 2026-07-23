import type { Response, NextFunction } from 'express';
import { eq, desc, sql } from 'drizzle-orm';
import { db } from '../config/database.js';
import { customerProfiles, orders, addresses } from '../db/schema.js';
import { sendSuccess } from '../utils/response.util.js';
import type { AuthenticatedRequest } from '../middleware/auth.middleware.js';
import { AppError } from '../utils/app-error.js';

export async function listCustomersController(_req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const customers = await db.select().from(customerProfiles).where(eq(customerProfiles.role, 'customer')).orderBy(desc(customerProfiles.createdAt));

    const enriched = await Promise.all(customers.map(async c => {
      const customerOrders = await db.select().from(orders).where(eq(orders.customerId, c.id));
      const orderCount = customerOrders.length;
      const ltv = customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const { passwordHash: _, ...safe } = c;
      return { ...safe, orderCount, ltv };
    }));

    sendSuccess(res, enriched);
  } catch (e) { next(e); }
}

export async function getCustomerController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const [customer] = await db.select().from(customerProfiles).where(eq(customerProfiles.id, id));
    if (!customer) throw new AppError(404, 'Customer not found');

    const customerOrders = await db.select().from(orders).where(eq(orders.customerId, id)).orderBy(desc(orders.placedAt));
    const customerAddresses = await db.select().from(addresses).where(eq(addresses.customerId, id));
    const { passwordHash: _, ...safe } = customer;

    sendSuccess(res, {
      ...safe,
      orderCount: customerOrders.length,
      ltv: customerOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
      orders: customerOrders,
      addresses: customerAddresses
    });
  } catch (e) { next(e); }
}

export async function updateCustomerRoleController(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { role } = req.body;
    await db.update(customerProfiles).set({ role, updatedAt: new Date() }).where(eq(customerProfiles.id, id));
    sendSuccess(res, { id, role }, 'Role updated');
  } catch (e) { next(e); }
}
