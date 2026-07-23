import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { customerProfiles } from '../db/schema.js';
import { createCustomerProfile, findCustomerByEmail, findCustomerById } from '../repositories/auth.repository.js';
import { signToken } from '../utils/jwt.util.js';
import { AppError } from '../utils/app-error.js';

const SALT_ROUNDS = 10;

function sanitizeCustomer(customer: typeof customerProfiles.$inferSelect) {
  const { passwordHash: _, ...rest } = customer;
  return rest;
}

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}) {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new AppError(409, 'User already exists');
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const lastNameSafe = input.lastName || '';
  const customer = await createCustomerProfile({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: lastNameSafe,
    phone: input.phone,
    role: 'customer'
  });

  if (!customer) {
    throw new AppError(500, 'Failed to create user');
  }

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function authenticateCustomer(email: string, password: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return null;

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function getCustomerProfile(id: number) {
  const customer = await findCustomerById(id);
  if (!customer) {
    throw new AppError(404, 'User not found');
  }
  return sanitizeCustomer(customer);
}

export async function updateCustomerPassword(id: number, newPassword: string) {
  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db.update(customerProfiles).set({ passwordHash, updatedAt: new Date() }).where(eq(customerProfiles.id, id));
}
