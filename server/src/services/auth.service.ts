import { createCustomerProfile, findCustomerByEmail } from '../repositories/auth.repository.js';

export async function registerCustomer(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}) {
  const existing = await findCustomerByEmail(input.email);
  if (existing) {
    throw new Error('User already exists');
  }

  const passwordHash = `hashed:${input.password}`;
  return createCustomerProfile({
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
    role: 'customer'
  });
}
