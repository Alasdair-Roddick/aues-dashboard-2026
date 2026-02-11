"use server";

import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { saltAndHashPassword, verifyPassword } from "@/app/utils/password";

/**
 *
 * @returns The current authenticated user's details or null if not authenticated
 */

export async function getCurrentUser() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      lastName: users.lastName,
      email: users.email,
      phoneNumber: users.phoneNumber,
      role: users.role,
      isActive: users.isActive,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      image: users.image,
      bankName: users.bankName,
      BSB: users.BSB,
      accountNumber: users.accountNumber,
      accountName: users.accountName,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  return user ?? null;
}

export type CurrentUser = Awaited<ReturnType<typeof getCurrentUser>>;

export async function updateCurrentUser(data: {
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  bankName?: string;
  BSB?: string;
  accountNumber?: string;
  accountName?: string;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    await db
      .update(users)
      .set({
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        bankName: data.bankName,
        BSB: data.BSB,
        accountNumber: data.accountNumber,
        accountName: data.accountName,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to update profile" };
  }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const session = await auth();

  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  try {
    // Get current user with password hash
    const [user] = await db
      .select({ password: users.password })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1);

    if (!user) {
      return { success: false, error: "User not found" };
    }

    // Verify current password
    const isValid = await verifyPassword(data.currentPassword, user.password);
    if (!isValid) {
      return { success: false, error: "Current password is incorrect" };
    }

    // Validate new password
    if (data.newPassword.length < 8) {
      return { success: false, error: "New password must be at least 8 characters" };
    }

    // Hash and save new password
    const hashedPassword = await saltAndHashPassword(data.newPassword);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    return { success: true };
  } catch (error) {
    return { success: false, error: "Failed to change password" };
  }
}
