"use server";

import { addUser } from "./lib/addUser";
import { db } from "@/app/db";
import { users } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { saltAndHashPassword } from "@/app/utils/password";

export async function getAllUsersAction() {
  try {
    const allUsers = await db.select().from(users);
    return allUsers.map((u) => ({
      id: u.id,
      name: u.name,
      image: u.image,
      role: u.role as "Admin" | "General" | "Temporary",
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
    const username = formData.get("username") as string;
    const role = formData.get("role") as "Admin" | "General" | "Temporary";

    if (!username || !role) {
      return { success: false, error: "Username and role are required" };
    }

    // Automatically set password to username2025
    const password = `${username}2025`;

    await addUser(username, password, role);
    return { success: true };
  } catch (error) {
    console.error("Error adding user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to add user"
    };
  }
}

export async function updateUserAction(
  userId: string,
  data: {
    name?: string;
    password?: string;
    role?: "Admin" | "General" | "Temporary";
    isActive?: boolean;
  }
) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name) updateData.name = data.name;
    if (data.password) updateData.password = await saltAndHashPassword(data.password);
    if (data.role) updateData.role = data.role;
    if (typeof data.isActive === "boolean") updateData.isActive = data.isActive;

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update user"
    };
  }
}

export async function deleteUserAction(userId: string) {
  try {
    if (!userId) {
      return { success: false, error: "User ID is required" };
    }

    await db.delete(users).where(eq(users.id, userId));

    return { success: true };
  } catch (error) {
    console.error("Error deleting user:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete user"
    };
  }
}
