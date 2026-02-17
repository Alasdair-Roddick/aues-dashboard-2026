/**
 * @file app/api/cron/sync-members/route.ts
 * @description Waits for an external app to ping it, runs a full member sync,
 * and returns an adaptive interval for the next check based on how many
 * new members were found.
 */

import { fullSync } from "@/app/lib/rubric";
import { NextResponse } from "next/server";

let lastSync = 0;
const MIN_SYNC_INTERVAL = 1000 * 60 * 1; // 1 minute

// Adaptive intervals (in seconds) returned to the external caller
const INTERVAL_HIGH = 60 * 1; // 1 min — lots of new members, check again soon
const INTERVAL_MEDIUM = 60 * 5; // 5 min — a few new members
const INTERVAL_LOW = 60 * 30; // 30 min — no new members, check less often

function getNextCheckInterval(newMembers: number): number {
  if (newMembers >= 10) return INTERVAL_HIGH;
  if (newMembers >= 1) return INTERVAL_MEDIUM;
  return INTERVAL_LOW;
}

export async function POST(request: Request) {
  const auth = request.headers.get("Authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (Date.now() - lastSync < MIN_SYNC_INTERVAL) {
    return NextResponse.json(
      { error: "Sync already in progress or recently completed" },
      { status: 429 },
    );
  }

  lastSync = Date.now();
  try {
    const { newMembers, durationSeconds } = await fullSync();
    const nextCheckInSeconds = getNextCheckInterval(newMembers);

    return NextResponse.json({
      message: "Members synced successfully",
      newMembers,
      durationSeconds,
      nextCheckInSeconds,
    });
  } catch (error) {
    console.error("Error syncing members:", error);
    return NextResponse.json({ error: "Failed to sync members" }, { status: 500 });
  }
}
