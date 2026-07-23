import { createCustomerProfile, findCustomerByEmail } from '../repositories/auth.repository.js';

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  phone?: string;
}) {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new Error('User already exists');
  }

  const passwordHash = `hashed:${input.password}`;
  const lastNameSafe = input.lastName || '';
  return createCustomerProfile({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: lastNameSafe,
    phone: input.phone,
    role: 'customer'
  });
}

export async function authenticateCustomer(email: string, password: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;
  const expected = `hashed:${password}`;
  if ((customer as any).passwordHash !== expected) return null;
  // Do not return passwordHash to caller
  const { passwordHash, ...sanitized } = customer as any;
  return sanitized;
}
