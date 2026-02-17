"use server";

import { db } from "@/app/db";
import { userCustomisations } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { getSessionRole, getSessionUserId } from "@/lib/session";

export async function getUserCustomizations(userId: string) {
  try {
    const session = await auth();
    const sessionUserId = await getSessionUserId(session?.user);
    const userRole = await getSessionRole(session?.user);

    if (!session?.user || !sessionUserId || (userRole !== "Admin" && sessionUserId !== userId)) {
      return null;
    }

    const customizations = await db
      .select()
      .from(userCustomisations)
      .where(eq(userCustomisations.userId, userId))
      .limit(1);

    if (customizations.length === 0) {
      return null;
    }

    return {
      lightPrimaryColor: customizations[0].lightPrimaryColor,
      lightSecondaryColor: customizations[0].lightSecondaryColor,
      darkPrimaryColor: customizations[0].darkPrimaryColor,
      darkSecondaryColor: customizations[0].darkSecondaryColor,
      theme: customizations[0].theme,
    };
  } catch (error) {
    console.error("Error fetching user customizations:", error);
    return null;
  }
}

export async function updateUserCustomizations(
  userId: string,
  lightPrimaryColor: string,
  lightSecondaryColor: string,
  darkPrimaryColor: string,
  darkSecondaryColor: string,
  theme: "light" | "dark" | "system",
) {
  try {
    const session = await auth();
    const sessionUserId = await getSessionUserId(session?.user);
    const userRole = await getSessionRole(session?.user);

    if (!session?.user || !sessionUserId || (userRole !== "Admin" && sessionUserId !== userId)) {
      return { success: false, error: "Unauthorized" };
    }

    await db
      .insert(userCustomisations)
      .values({
        userId,
        lightPrimaryColor,
        lightSecondaryColor,
        darkPrimaryColor,
        darkSecondaryColor,
        theme,
      })
      .onConflictDoUpdate({
        target: userCustomisations.userId,
        set: {
          lightPrimaryColor,
          lightSecondaryColor,
          darkPrimaryColor,
          darkSecondaryColor,
          theme,
        },
      });

    return { success: true };
  } catch (error) {
    console.error("Error updating user customizations:", error);
    return { success: false, error: "Failed to update customizations" };
  }
}
