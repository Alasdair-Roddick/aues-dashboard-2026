"use server";

import { addUser } from "./lib/addUser";
import { db } from "@/app/db";
import { users, members } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { saltAndHashPassword } from "@/app/utils/password";
import { auth } from "@/auth";
import { ActivityLogger } from "@/app/lib/activity";
import crypto from "crypto";

type UserRole = "Admin" | "General" | "Temporary" | "Treasurer";

function getRoleFromSessionUser(user: unknown): UserRole | null {
  if (!user || typeof user !== "object") {
    return null;
  }

  const role = (user as { role?: string }).role;
  if (role === "Admin" || role === "General" || role === "Temporary" || role === "Treasurer") {
    return role;
  }

  return null;
}

function generateTemporaryPassword(): string {
  // 16-char URL-safe temporary password.
  return crypto.randomBytes(12).toString("base64url").slice(0, 16);
}

export async function getAllUsersAction() {
  try {
    const session = await auth();
    const userRole = getRoleFromSessionUser(session?.user);

    if (!session?.user || userRole !== "Admin") {
      return [];
    }

    const allUsers = await db.select().from(users);
    return allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      role: u.role as "Admin" | "General" | "Temporary" | "Treasurer",
      isActive: u.isActive,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

export async function addUserAction(formData: FormData) {
  try {
    const session = await auth();
    const userRole = getRoleFromSessionUser(session?.user);

    if (!session?.user || userRole !== "Admin") {
      return { success: false, error: "Unauthorized - Admin role required" };
    }

    const username = formData.get("username") as string;
    const role = formData.get("role") as UserRole;

    if (!username || !role) {
      return { success: false, error: "Username and role are required" };
    }

    const password = generateTemporaryPassword();

    const createdUser = await addUser(username, password, role);
    await ActivityLogger.userCreated(
      { id: session.user.id as string, name: session.user.name as string },
      { id: createdUser.id, name: createdUser.name, role: createdUser.role },
    );
    return {
      success: true,
      temporaryPassword: password,
      user: {
        id: createdUser.id,
        name: createdUser.name,
        image: createdUser.image,
        role: createdUser.role as UserRole,
        isActive: createdUser.isActive,
        createdAt: createdUser.createdAt,
        updatedAt: createdUser.updatedAt,
      },
    };
  } catch (error) {
    console.error("Error adding user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add user",
    };
  }
}

export async function updateUserAction(
  userId: string,
  data: {
    name?: string;
    password?: string;
    role?: UserRole;
    isActive?: boolean;
  },
) {
  try {
    const session = await auth();
    const userRole = getRoleFromSessionUser(session?.user);

    if (!session?.user || userRole !== "Admin") {
      return { success: false, error: "Unauthorized - Admin role required" };
    }

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const updateData: {
      updatedAt: Date;
      name?: string;
      password?: string;
      role?: UserRole;
      isActive?: boolean;
    } = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password = await saltAndHashPassword(data.password);
    if (data.role) updateData.role = data.role;
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

    // Fetch target user name for logging
    const [targetUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);

    await db.update(users).set(updateData).where(eq(users.id, userId));

    if (data.role && targetUser) {
      await ActivityLogger.userRoleChanged(
        { id: session.user.id as string, name: session.user.name as string },
        { id: userId, name: targetUser.name },
        "",
        data.role,
      );
    } else if (targetUser) {
      await ActivityLogger.userUpdated(
        { id: session.user.id as string, name: session.user.name as string },
        { id: userId, name: targetUser.name },
        data,
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user",
    };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    const session = await auth();
    const userRole = getRoleFromSessionUser(session?.user);

    if (!session?.user || userRole !== "Admin") {
      return { success: false, error: "Unauthorized - Admin role required" };
    }

    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const [targetUser] = await db.select({ name: users.name }).from(users).where(eq(users.id, userId)).limit(1);

    await db.delete(users).where(eq(users.id, userId));

    if (targetUser) {
      await ActivityLogger.userDeleted(
        { id: session.user.id as string, name: session.user.name as string },
        { id: userId, name: targetUser.name },
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user",
    };
  }
}

export async function getAllMembersAction() {
  try {
    const session = await auth();
    const userRole = getRoleFromSessionUser(session?.user);

    if (!session?.user || userRole === "Temporary" || !userRole) {
      return [];
    }

    const allMembers = await db.select().from(members);
    return allMembers.map((m) => ({
      id: m.id,
      fullname: m.fullname,
      email: m.email,
      phonenumber: m.phonenumber,
      membershipId: m.membershipId,
      membershipType: m.membershipType,
      pricePaid: m.pricePaid,
      paymentMethod: m.paymentMethod,
      isValid: m.isValid,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    }));
  } catch (error) {
    console.error("Error fetching members:", error);
    return [];
  }
}
