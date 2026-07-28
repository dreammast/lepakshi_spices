import crypto from "node:crypto";
import { eq, and, gt, lt, desc } from "drizzle-orm";
import { db } from "../config/database.js";
import { emailOtps } from "../db/schema.js";

const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 10;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_SECONDS = 60;

function generateSecureOtp(): string {
  const bytes = crypto.randomBytes(4);
  const num = bytes.readUInt32BE(0);
  return String(num % 10 ** OTP_LENGTH).padStart(OTP_LENGTH, "0");
}

function hashOtp(otp: string): string {
  return crypto.createHash("sha256").update(otp).digest("hex");
}

type OtpPurpose = "EMAIL_VERIFICATION" | "PASSWORD_RESET" | "LOGIN_VERIFICATION";

export async function generateOtp(email: string, purpose: OtpPurpose) {
  await cleanupExpiredOtps();
  const recentOtp = await db
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.email, email),
        eq(emailOtps.purpose, purpose),
        eq(emailOtps.verified, false),
        gt(emailOtps.expiresAt, new Date())
      )
    )
    .orderBy(desc(emailOtps.createdAt))
    .limit(1);

  if (recentOtp.length > 0) {
    const createdAt = new Date(recentOtp[0].createdAt).getTime();
    const elapsed = (Date.now() - createdAt) / 1000;
    if (elapsed < RESEND_COOLDOWN_SECONDS) {
      const waitSeconds = Math.ceil(RESEND_COOLDOWN_SECONDS - elapsed);
      throw new Error(`Please wait ${waitSeconds} seconds before requesting a new code.`);
    }
  }

  const otp = generateSecureOtp();
  const otpHash = hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await db.insert(emailOtps).values({
    email,
    otpHash,
    purpose,
    expiresAt,
    attempts: 0,
    verified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return { otp, expiresAt };
}

export async function verifyOtp(email: string, otp: string, purpose: OtpPurpose) {
  const otpHash = hashOtp(otp);

  const records = await db
    .select()
    .from(emailOtps)
    .where(
      and(
        eq(emailOtps.email, email),
        eq(emailOtps.purpose, purpose),
        eq(emailOtps.verified, false)
      )
    )
    // Use the most recently issued code so an old expired code cannot shadow it.
    .orderBy(desc(emailOtps.createdAt))
    .limit(1);

  if (records.length === 0) {
    throw new Error("No verification code found. Please request a new one.");
  }

  const record = records[0];

  if (record.verified) {
    throw new Error("This code has already been used.");
  }

  if (new Date(record.expiresAt).getTime() < Date.now()) {
    throw new Error("This code has expired. Please request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await db
      .update(emailOtps)
      .set({ verified: true, updatedAt: new Date() })
      .where(eq(emailOtps.id, record.id));
    throw new Error("Too many failed attempts. Please request a new code.");
  }

  if (record.otpHash !== otpHash) {
    await db
      .update(emailOtps)
      .set({ attempts: record.attempts + 1, updatedAt: new Date() })
      .where(eq(emailOtps.id, record.id));
    const remaining = MAX_ATTEMPTS - record.attempts - 1;
    throw new Error(`Invalid code. ${remaining} attempts remaining.`);
  }

  await db
    .update(emailOtps)
    .set({ verified: true, updatedAt: new Date() })
    .where(eq(emailOtps.id, record.id));

  return true;
}

export async function cleanupExpiredOtps() {
  await db
    .delete(emailOtps)
    .where(lt(emailOtps.expiresAt, new Date()));
}
