// checks the user profile to make sure these have been set
/**
 * @PersonalInformation:
 *  - lastname
 *  - email
 *  - phone number
 *  - profile picture url is not null
 *
 * @Security
 * - password is not default password (username2026)
 *
 * @Financial
 * - payment method is set
 */

import { users } from "@/app/db/schema";
import { db } from "@/app/db/index";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/getUser";
import { verifyPassword } from "../utils/password";

/**
 *
 * @param userId - The user id from the currently logged in user
 * @returns - true if account setup is complete, false otherwise
 *
 * Example Usage:
 * ```ts
 * const isComplete = await isAccountSetupComplete(currentUser.id);
 * if (!isComplete) {
 *   // Redirect to account setup page
 * }
 * ```
 */

export async function isAccountSetupComplete(userId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  // Check personal information
  if (!user.lastName || !user.email || !user.phoneNumber || !user.image) {
    return false;
  }

  // Check financial information
  if (!user.bankName || !user.BSB || !user.accountNumber || !user.accountName) {
    return false;
  }

  // If all checks pass, return true
  return true;
}

/**
 *
 * @param userId - The user id from the currently logged in user
 * Marks the user's account setup as complete
 */

export async function markAccountSetupComplete(userId: string) {
  await db.update(users).set({ accountSetupComplete: true }).where(eq(users.id, userId));
}

/**
 *
 * @param userId - The user id from the currently logged in user
 * Marks the user's account setup as incomplete
 */

export async function markAccountSetupIncomplete(userId: string) {
  await db.update(users).set({ accountSetupComplete: false }).where(eq(users.id, userId));
}
