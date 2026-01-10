"use server";

import { db } from "@/app/db";
import { userCustomisations } from "@/app/db/schema";
import { eq } from "drizzle-orm";

export async function getUserCustomizations(userId: string) {
  try {
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
  theme: "light" | "dark" | "system"
) {
  try {
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
