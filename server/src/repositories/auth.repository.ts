import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { customerProfiles } from '../db/schema.js';

export type CreateCustomerProfileInput = {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: 'customer' | 'staff' | 'manager' | 'admin';
};

export async function findCustomerByEmail(email: string) {
  const [customer] = await db.select().from(customerProfiles).where(eq(customerProfiles.email, email));
  return customer ?? null;
}

export async function createCustomerProfile(input: CreateCustomerProfileInput) {
  await db.insert(customerProfiles).values({
    email: input.email,
    passwordHash: input.passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    role: input.role ?? 'customer',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return findCustomerByEmail(input.email);
}
