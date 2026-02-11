"use server";

import { fullSync, invalidateRubricSettingsCache } from "@/app/lib/rubric";

export async function syncMembers() {
  try {
    invalidateRubricSettingsCache();
    await fullSync();
    return { success: true };
  } catch (error) {
    console.error("Error syncing members:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
