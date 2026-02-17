"use server";

/**
 * Shared types and utilities for session and role management
 */

export type UserRole = "Admin" | "General" | "Temporary" | "Treasurer";

/**
 * Extracts the role from a session user object.
 * Returns null if the user doesn't have a valid role.
 *
 * @param user - The user object from the session (may be of unknown type)
 * @returns The user's role or null
 */
export function getSessionRole(user: unknown): UserRole | null {
  const role = (user as { role?: UserRole } | undefined)?.role;
  return role ?? null;
}

/**
 * Extracts the user ID from a session user object.
 * Returns undefined if the user doesn't have an ID.
 *
 * @param user - The user object from the session (may be of unknown type)
 * @returns The user's ID or undefined
 */
export function getSessionUserId(user: unknown): string | undefined {
  const userId = (user as { id?: string } | undefined)?.id;
  return userId;
}
