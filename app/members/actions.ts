"use server";

import { fullSync } from "@/app/lib/rubric";

export async function syncMembers() {
  try {
    await fullSync();
    return { success: true };
  } catch (error) {
    console.error("Error syncing members:", error);
    return { success: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}
