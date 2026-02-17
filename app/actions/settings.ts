"use server";

import { db } from "@/app/db";
import { siteSettings } from "@/app/db/schema";
import { auth } from "@/auth";
import { encrypt, decrypt } from "@/app/lib/encryption";
import { invalidateSquarespaceSettingsCache } from "@/app/lib/squarespace";
import { eq } from "drizzle-orm";
import { getSessionRole } from "@/lib/session";

export type SiteSettingsData = {
  qpayUrl: string | null;
  qpayEmail: string | null;
  qpaySessionId: string | null;
  qpayMembershipName: string | null;
  squarespaceApiKey: string | null;
  squarespaceApiUrl: string | null;
  squarespaceApiVersion: string | null;
  pubcrawlShirtKeyword: string | null;
};

export async function getSiteSettings(): Promise<SiteSettingsData | null> {
  try {
    const session = await auth();
    const userRole = getSessionRole(session?.user);

    // Only Admin can view settings
    if (!session?.user || userRole !== "Admin") {
      return null;
    }

    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length === 0) {
      return null;
    }

    const s = settings[0];

    // Decrypt all sensitive fields
    return {
      qpayUrl: s.qpayUrl ? decrypt(s.qpayUrl) : null,
      qpayEmail: s.qpayEmail ? decrypt(s.qpayEmail) : null,
      qpaySessionId: s.qpaySessionId ? decrypt(s.qpaySessionId) : null,
      qpayMembershipName: s.qpayMembershipName ? decrypt(s.qpayMembershipName) : null,
      squarespaceApiKey: s.squarespaceApiKey ? decrypt(s.squarespaceApiKey) : null,
      squarespaceApiUrl: s.squarespaceApiUrl ? decrypt(s.squarespaceApiUrl) : null,
      squarespaceApiVersion: s.squarespaceApiVersion ? decrypt(s.squarespaceApiVersion) : null,
      pubcrawlShirtKeyword: s.pubcrawlShirtKeyword ? decrypt(s.pubcrawlShirtKeyword) : null,
    };
  } catch (error) {
    console.error("Error fetching site settings:", error);
    return null;
  }
}

export async function updateSiteSettings(
  data: SiteSettingsData,
): Promise<{ success: boolean; error?: string }> {
  try {
    const session = await auth();
    const userRole = getSessionRole(session?.user);

    // Only Admin can update settings
    if (!session?.user || userRole !== "Admin") {
      return { success: false, error: "Unauthorized" };
    }

    // Encrypt all sensitive fields
    const encryptedData = {
      qpayUrl: data.qpayUrl ? encrypt(data.qpayUrl) : null,
      qpayEmail: data.qpayEmail ? encrypt(data.qpayEmail) : null,
      qpaySessionId: data.qpaySessionId ? encrypt(data.qpaySessionId) : null,
      qpayMembershipName: data.qpayMembershipName ? encrypt(data.qpayMembershipName) : null,
      squarespaceApiKey: data.squarespaceApiKey ? encrypt(data.squarespaceApiKey) : null,
      squarespaceApiUrl: data.squarespaceApiUrl ? encrypt(data.squarespaceApiUrl) : null,
      squarespaceApiVersion: data.squarespaceApiVersion
        ? encrypt(data.squarespaceApiVersion)
        : null,
      pubcrawlShirtKeyword: data.pubcrawlShirtKeyword ? encrypt(data.pubcrawlShirtKeyword) : null,
      updatedAt: new Date(),
    };

    // Check if settings exist
    const existing = await db.select({ id: siteSettings.id }).from(siteSettings).limit(1);

    if (existing.length === 0) {
      // Insert new settings
      await db.insert(siteSettings).values({
        ...encryptedData,
        createdAt: new Date(),
      });
    } else {
      // Update existing settings
      await db.update(siteSettings).set(encryptedData).where(eq(siteSettings.id, existing[0].id));
    }

    invalidateSquarespaceSettingsCache();

    return { success: true };
  } catch (error) {
    console.error("Error updating site settings:", error);
    return { success: false, error: "Failed to update settings" };
  }
}

// Internal function to get decrypted settings for use in other server code
export async function getDecryptedSettings(): Promise<SiteSettingsData | null> {
  try {
    const session = await auth();
    const userRole = getSessionRole(session?.user);

    if (!session?.user || userRole !== "Admin") {
      return null;
    }

    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length === 0) {
      return null;
    }

    const s = settings[0];

    return {
      qpayUrl: s.qpayUrl ? decrypt(s.qpayUrl) : null,
      qpayEmail: s.qpayEmail ? decrypt(s.qpayEmail) : null,
      qpaySessionId: s.qpaySessionId ? decrypt(s.qpaySessionId) : null,
      qpayMembershipName: s.qpayMembershipName ? decrypt(s.qpayMembershipName) : null,
      squarespaceApiKey: s.squarespaceApiKey ? decrypt(s.squarespaceApiKey) : null,
      squarespaceApiUrl: s.squarespaceApiUrl ? decrypt(s.squarespaceApiUrl) : null,
      squarespaceApiVersion: s.squarespaceApiVersion ? decrypt(s.squarespaceApiVersion) : null,
      pubcrawlShirtKeyword: s.pubcrawlShirtKeyword ? decrypt(s.pubcrawlShirtKeyword) : null,
    };
  } catch (error) {
    console.error("Error fetching decrypted settings:", error);
    return null;
  }
}
