import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../config/database.js";
import { eq } from "drizzle-orm";
import { customerProfiles } from "../db/schema.js";

export const authInstance = betterAuth({
  baseURL: (process.env.BETTER_AUTH_URL || "http://localhost:4000") + "/api/auth",
  database: drizzleAdapter(db as any, {
    provider: "mysql",
    camelCase: true,
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "customer",
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user: any) => {
          try {
            const existing = await db
              .select()
              .from(customerProfiles)
              .where(eq(customerProfiles.email, user.email))
              .limit(1);

            if (existing.length === 0) {
              const nameParts = (user.name || "").trim().split(/\s+/);
              const firstName = nameParts.shift() || user.email.split("@")[0] || "User";
              const lastName = nameParts.join(" ") || "";

              await db.insert(customerProfiles).values({
                email: user.email,
                passwordHash: "",
                firstName,
                lastName,
                avatarUrl: user.image || null,
                role: (user.role as any) || "customer",
                segment: "new",
                isActive: true,
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            } else {
              const updates: Record<string, any> = { updatedAt: new Date() };
              if (user.image && existing[0].avatarUrl !== user.image) {
                updates.avatarUrl = user.image;
              }
              if (Object.keys(updates).length > 1) {
                await db
                  .update(customerProfiles)
                  .set(updates)
                  .where(eq(customerProfiles.email, user.email));
              }
            }
          } catch (err) {
            console.error("Better Auth user sync failed:", err);
          }
        },
      },
    },
  },
});
