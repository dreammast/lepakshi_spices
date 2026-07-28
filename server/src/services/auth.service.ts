import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../config/database.js';
import { customerProfiles } from '../db/schema.js';
import { createCustomerProfile, findCustomerByEmail, findCustomerById } from '../repositories/auth.repository.js';
import { signToken } from '../utils/jwt.util.js';
import { AppError } from '../utils/app-error.js';
import { sendEmailSafely, verificationEmailTemplate, forgotPasswordOtpTemplate, passwordResetSuccessTemplate, welcomeEmailTemplate } from '../mail/send-email.js';
import { env } from '../config/env.js';

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

  const name = `${customer.firstName} ${customer.lastName}`.trim() || 'there';
  await sendEmailSafely({ to: customer.email, subject: 'Welcome to Lepakshi Spices', html: welcomeEmailTemplate(name) });
  await sendVerificationEmail(customer.email);

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function authenticateCustomer(email: string, password: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) return null;

  if (!customer.passwordHash) {
    throw new AppError(400, 'This account uses social login. Please sign in with Google.');
  }

  const valid = await bcrypt.compare(password, customer.passwordHash);
  if (!valid) return null;

  if (!customer.isActive) {
    throw new AppError(403, 'Account has been suspended. Please contact support.');
  }

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function authenticateAdmin(username: string, password: string) {
  const { env } = await import('../config/env.js');
  if (username !== env.ADMIN_USERNAME || password !== env.ADMIN_PASSWORD) return null;
  const user = { id: 0, email: username, firstName: 'Admin', lastName: '', role: 'admin' as const };
  const token = signToken({ sub: 0, email: username, role: 'admin' });
  return { user, token };
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

export async function syncOAuthUser(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  phone?: string;
  provider: string;
  providerAccountId?: string;
}) {
  if (!input.email) throw new AppError(400, 'Email is required');
  let customer = await findCustomerByEmail(input.email);
  const firstName = input.firstName || input.email.split('@')[0] || 'User';
  const lastName = input.lastName || '';

  if (customer) {
    const updates: Record<string, any> = { updatedAt: new Date() };
    if (firstName && customer.firstName !== firstName) updates.firstName = firstName;
    if (lastName !== undefined && customer.lastName !== lastName) updates.lastName = lastName;
    if (input.avatarUrl && customer.avatarUrl !== input.avatarUrl) updates.avatarUrl = input.avatarUrl;
    if (input.phone && customer.phone !== input.phone) updates.phone = input.phone;

    if (Object.keys(updates).length > 1) {
      await db.update(customerProfiles).set(updates).where(eq(customerProfiles.id, customer.id));
      customer = (await findCustomerByEmail(input.email))!;
    }
  } else {
    customer = await createCustomerProfile({
      email: input.email,
      passwordHash: '',
      firstName,
      lastName,
      phone: input.phone || '',
      role: 'customer'
    });
  }

  if (!customer) {
    throw new AppError(500, 'Failed to sync user');
  }

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function sendForgotPasswordOtp(email: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) {
    throw new AppError(404, 'No account found with this email address.');
  }
  const { generateOtp } = await import('../services/otp.service.js');
  const { otp } = await generateOtp(email, 'PASSWORD_RESET');
  const name = `${customer.firstName} ${customer.lastName}`.trim() || 'there';

  await sendEmailSafely({
    to: email,
    subject: 'Reset Your Password - Lepakshi Spices',
    html: forgotPasswordOtpTemplate(name, otp),
  });

  return { message: 'Verification code sent to your email.' };
}

export async function verifyResetOtp(email: string, otp: string) {
  const { verifyOtp } = await import('../services/otp.service.js');
  return verifyOtp(email, otp, 'PASSWORD_RESET');
}

export async function resetPassword(email: string, newPassword: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) {
    throw new AppError(404, 'No account found with this email address.');
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db
    .update(customerProfiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(customerProfiles.id, customer.id));

  const name = `${customer.firstName} ${customer.lastName}`.trim() || 'there';

  await sendEmailSafely({
    to: email,
    subject: 'Password Reset Successful - Lepakshi Spices',
    html: passwordResetSuccessTemplate(name),
  });

  return { message: 'Password has been reset successfully.' };
}

export async function changePassword(userId: number, currentPassword: string, newPassword: string) {
  const customer = await findCustomerById(userId);
  if (!customer) {
    throw new AppError(404, 'User not found');
  }

  if (customer.passwordHash) {
    const valid = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!valid) {
      throw new AppError(400, 'Current password is incorrect.');
    }
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  await db
    .update(customerProfiles)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(customerProfiles.id, userId));

  return { message: 'Password changed successfully.' };
}

export async function updateProfile(userId: number, input: {
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatarUrl?: string;
}) {
  const customer = await findCustomerById(userId);
  if (!customer) {
    throw new AppError(404, 'User not found');
  }

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName !== undefined) updates.lastName = input.lastName;
  if (input.phone !== undefined) updates.phone = input.phone;
  if (input.avatarUrl !== undefined) updates.avatarUrl = input.avatarUrl;

  await db.update(customerProfiles).set(updates).where(eq(customerProfiles.id, userId));
  const updated = await findCustomerById(userId);
  return sanitizeCustomer(updated!);
}

export async function exchangeSessionForJwt(sessionData: { user?: { email?: string } }) {
  const email = sessionData?.user?.email;
  if (!email) throw new AppError(401, 'No active Better Auth session');

  const customer = await findCustomerByEmail(email);
  if (!customer) throw new AppError(404, 'User not found');

  const token = signToken({ sub: customer.id, email: customer.email, role: customer.role });
  return { user: sanitizeCustomer(customer), token };
}

export async function sendVerificationEmail(email: string) {
  const customer = await findCustomerByEmail(email);
  if (!customer) {
    throw new AppError(404, 'No account found with this email address.');
  }
  if (customer.emailVerified) {
    return { message: 'Email is already verified.' };
  }

  const { generateOtp } = await import('../services/otp.service.js');
  const { otp } = await generateOtp(email, 'EMAIL_VERIFICATION');
  const name = `${customer.firstName} ${customer.lastName}`.trim() || 'there';
  const verificationUrl = `${env.API_PUBLIC_URL.replace(/\/$/, '')}/auth/verify-email?email=${encodeURIComponent(email)}&token=${otp}`;

  await sendEmailSafely({
    to: email,
    subject: 'Verify Your Email - Lepakshi Spices',
    html: verificationEmailTemplate(name, verificationUrl),
  });

  return { message: 'Verification email sent.' };
}

export async function verifyEmail(email: string, otp: string) {
  const { verifyOtp } = await import('../services/otp.service.js');
  await verifyOtp(email, otp, 'EMAIL_VERIFICATION');

  await db
    .update(customerProfiles)
    .set({ emailVerified: true, updatedAt: new Date() })
    .where(eq(customerProfiles.email, email));

  return { message: 'Email verified successfully.' };
}
