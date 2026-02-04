import 'dotenv/config';
import axios from 'axios';
import { members, membershipPayments, membershipResponses, siteSettings } from '../db/schema';
import { db } from '../db/index';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { decrypt } from './encryption';

// Cache for settings to avoid repeated DB calls
let settingsCache: {
  qpayUrl: string | null;
  qpayEmail: string | null;
  qpaySessionId: string | null;
} | null = null;
let settingsCacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getRubricSettings() {
  // Check cache
  if (settingsCache && Date.now() - settingsCacheTime < CACHE_TTL) {
    return settingsCache;
  }

  try {
    const settings = await db.select().from(siteSettings).limit(1);

    if (settings.length > 0 && settings[0].qpayUrl) {
      settingsCache = {
        qpayUrl: settings[0].qpayUrl ? decrypt(settings[0].qpayUrl) : null,
        qpayEmail: settings[0].qpayEmail ? decrypt(settings[0].qpayEmail) : null,
        qpaySessionId: settings[0].qpaySessionId ? decrypt(settings[0].qpaySessionId) : null,
      };
      settingsCacheTime = Date.now();
      return settingsCache;
    }
  } catch (error) {
    console.error("Failed to fetch settings from database:", error);
  }

  // Fall back to environment variables
  return {
    qpayUrl: process.env.RUBRIC_API_URL || null,
    qpayEmail: process.env.RUBRIC_EMAIL || null,
    qpaySessionId: process.env.RUBRIC_SESSION_ID || null,
  };
}

export const MemberSchema = z.object({
    id: z.number(),
    fullname: z.string().max(150),
    email: z.string().email().max(255),
    phonenumber: z.string().max(64).optional().nullable(),
    membershipId: z.string().max(50).optional().nullable(),
    membershipType: z.string().max(50).optional().nullable(),
    pricePaid: z.string().optional().nullable(),
    paymentMethod: z.string().max(50).optional().nullable(),
    isValid: z.boolean().optional().nullable(),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
});

export type Member = z.infer<typeof MemberSchema>;

type RubricMembership = {
    membershipid: number | string;
    fullname: string;
    email: string;
    phonenumber?: string | null;
    membershiptype?: string | null;
    pricepaid?: string | number | null;
    paymentmethod?: string | null;
    paymentMethod?: string | null;
    isvalid?: number | boolean | null;
    created?: string | number | Date | null;
    updated?: string | number | Date | null;
    responses?: unknown;
};

export const fetchMembersFromRubric = async (): Promise<Member[]> => {
    const settings = await getRubricSettings();

    if (!settings.qpayUrl || !settings.qpaySessionId || !settings.qpayEmail) {
        throw new Error("QPay/Rubric API settings are not configured. Please configure them in Admin > Settings.");
    }

    const response = await axios.post(
        settings.qpayUrl,
        new URLSearchParams({
            details: JSON.stringify({
                sessionid: settings.qpaySessionId,
                email: settings.qpayEmail,
            }),
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.status !== 200) {
        throw new Error(`Failed to fetch members from Rubric: ${response.statusText}`);
    }

    // Check if the response is an error object
    if (response.data && typeof response.data === 'object' && 'success' in response.data && !response.data.success) {
        throw new Error(`Rubric API error: ${response.data.error || response.data.usererror || 'Unknown error'}`);
    }

    // Extract the allMemberships array from the response
    if (!response.data.allMemberships || !Array.isArray(response.data.allMemberships)) {
        throw new Error(`Expected allMemberships array from Rubric API, got: ${typeof response.data.allMemberships}`);
    }

    const membersData = response.data.allMemberships as RubricMembership[];
    console.log(`Fetched ${membersData.length} members from Rubric.`);
    console.log(membersData[0]); // Log the first member for inspection

    const members: Member[] = membersData.map((data) => {
        // Parse price: remove currency symbols and convert to number
        let parsedPrice: string | null = null;
        if (data.pricepaid) {
            const priceStr = String(data.pricepaid).replace(/[$,]/g, '');
            parsedPrice = parseFloat(priceStr).toFixed(2);
        }

        return MemberSchema.parse({
            id: data.membershipid,
            fullname: data.fullname,
            email: data.email,
            phonenumber: data.phonenumber === 'N/A' ? null : data.phonenumber,
            membershipId: data.membershipid?.toString(),
            membershipType: data.membershiptype,
            pricePaid: parsedPrice,
            paymentMethod: data.paymentmethod || data.paymentMethod,
            isValid: data.isvalid === 1,
            createdAt: data.created ? new Date(data.created) : new Date(),
            updatedAt: data.updated ? new Date(data.updated) : new Date(),
        });
    });

    return members;
};

export const syncMembersWithDatabase = async () => {
    const fetchedMembers = await fetchMembersFromRubric();
    console.log(`Syncing ${fetchedMembers.length} members with database...`);

    // Get all existing emails in one query
    const existingMembers = await db.select({ email: members.email }).from(members);
    const existingEmailsSet = new Set(existingMembers.map(m => m.email.toLowerCase()));

    // Filter out members that already exist
    const newMembers = fetchedMembers.filter(
        member => !existingEmailsSet.has(member.email.toLowerCase())
    );

    if (newMembers.length === 0) {
        console.log("No new members to insert.");
        return;
    }

    console.log(`Found ${newMembers.length} new members to insert.`);

    // Batch insert all new members at once
    const membersToInsert = newMembers.map(member => ({
        fullname: member.fullname,
        email: member.email,
        phonenumber: member.phonenumber ?? null,
        membershipId: member.membershipId ?? null,
        membershipType: member.membershipType ?? null,
        pricePaid: member.pricePaid ?? null,
        paymentMethod: member.paymentMethod ?? null,
        isValid: member.isValid ?? false,
        createdAt: member.createdAt ?? new Date(),
        updatedAt: new Date(),
    }));

    await db.insert(members).values(membersToInsert);
    console.log(`Successfully inserted ${newMembers.length} new members.`);
}

export const updateAllMembers = async () => {
    const fetchedMembers = await fetchMembersFromRubric();
    console.log(`Updating ${fetchedMembers.length} members...`);

    // Get all existing members with their IDs
    const existingMembers = await db.select().from(members);
    const emailToIdMap = new Map(
        existingMembers.map(m => [m.email.toLowerCase(), m.id])
    );

    // Prepare batch updates
    const membersToUpdate = fetchedMembers
        .filter(member => emailToIdMap.has(member.email.toLowerCase()))
        .map(member => ({
            id: emailToIdMap.get(member.email.toLowerCase())!,
            data: {
                fullname: member.fullname,
                phonenumber: member.phonenumber ?? null,
                membershipId: member.membershipId ?? null,
                membershipType: member.membershipType ?? null,
                pricePaid: member.pricePaid ?? null,
                paymentMethod: member.paymentMethod ?? null,
                isValid: member.isValid ?? false,
                updatedAt: new Date(),
            }
        }));

    console.log(`Updating ${membersToUpdate.length} existing members...`);

    // Update in batches to avoid overwhelming the database
    const batchSize = 100;
    for (let i = 0; i < membersToUpdate.length; i += batchSize) {
        const batch = membersToUpdate.slice(i, i + batchSize);
        await Promise.all(
            batch.map(({ id, data }) =>
                db.update(members).set(data).where(eq(members.id, id))
            )
        );
        console.log(`Updated ${Math.min(i + batchSize, membersToUpdate.length)}/${membersToUpdate.length}`);
    }

    console.log("Update complete.");
}

// Sync membership payments for members
export const syncMembershipPayments = async () => {
    const fetchedMembers = await fetchMembersFromRubric();
    console.log(`Syncing payments for ${fetchedMembers.length} members...`);

    // Get all existing members to map email to ID
    const existingMembers = await db.select().from(members);
    const emailToIdMap = new Map(
        existingMembers.map(m => [m.email.toLowerCase(), m.id])
    );

    // Get existing payments to avoid duplicates (based on memberId + membershipId)
    const existingPayments = await db.select().from(membershipPayments);
    const paymentKeys = new Set(
        existingPayments.map(p => `${p.memberId}-${p.transactionId}`)
    );

    // Prepare payment records
    const paymentsToInsert = fetchedMembers
        .filter(member => {
            const dbMemberId = emailToIdMap.get(member.email.toLowerCase());
            if (!dbMemberId) return false;

            const paymentKey = `${dbMemberId}-${member.membershipId}`;
            return !paymentKeys.has(paymentKey);
        })
        .map(member => {
            const dbMemberId = emailToIdMap.get(member.email.toLowerCase())!;
            return {
                memberId: dbMemberId,
                amount: member.pricePaid ?? null,
                method: member.paymentMethod ?? null,
                status: member.isValid ? "completed" : "pending",
                transactionId: member.membershipId ?? null,
                createdAt: member.createdAt ?? new Date(),
            };
        });

    if (paymentsToInsert.length === 0) {
        console.log("No new payments to insert.");
        return;
    }

    console.log(`Found ${paymentsToInsert.length} new payments to insert.`);
    await db.insert(membershipPayments).values(paymentsToInsert);
    console.log(`Successfully inserted ${paymentsToInsert.length} payments.`);
}

// Sync membership responses for members
export const syncMembershipResponses = async () => {
    const settings = await getRubricSettings();

    if (!settings.qpayUrl || !settings.qpaySessionId || !settings.qpayEmail) {
        throw new Error("QPay/Rubric API settings are not configured. Please configure them in Admin > Settings.");
    }

    const response = await axios.post(
        settings.qpayUrl,
        new URLSearchParams({
            details: JSON.stringify({
                sessionid: settings.qpaySessionId,
                email: settings.qpayEmail,
            }),
        }),
        { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (!response.data.allMemberships || !Array.isArray(response.data.allMemberships)) {
        throw new Error(`Expected allMemberships array from Rubric API`);
    }

    const membersData = response.data.allMemberships as RubricMembership[];
    console.log(`Syncing responses for ${membersData.length} members...`);

    // Get all existing members to map email to ID
    const existingMembers = await db.select().from(members);
    const emailToIdMap = new Map(
        existingMembers.map(m => [m.email.toLowerCase(), m.id])
    );

    // Get existing responses to avoid duplicates
    const existingResponses = await db.select().from(membershipResponses);
    const existingMemberIds = new Set(existingResponses.map(r => r.memberId));

    // Prepare response records - only for members with actual response data
    const responsesToInsert = membersData
        .filter(data => {
            const email = data.email?.toLowerCase();
            if (!email) return false;

            const dbMemberId = emailToIdMap.get(email);
            if (!dbMemberId) return false;

            // Only insert if we have responses data and haven't inserted for this member yet
            return data.responses && !existingMemberIds.has(dbMemberId);
        })
        .map(data => {
            const dbMemberId = emailToIdMap.get(data.email.toLowerCase())!;
            return {
                memberId: dbMemberId,
                responses: data.responses,
                createdAt: data.created ? new Date(data.created) : new Date(),
            };
        });

    if (responsesToInsert.length === 0) {
        console.log("No new responses to insert.");
        return;
    }

    console.log(`Found ${responsesToInsert.length} new responses to insert.`);
    await db.insert(membershipResponses).values(responsesToInsert);
    console.log(`Successfully inserted ${responsesToInsert.length} responses.`);
}

// Combined sync and update function for full refresh
export const fullSync = async () => {
    console.log("Starting full sync...");
    const startTime = Date.now();

    // First, add any new members
    await syncMembersWithDatabase();

    // Then sync payments and responses
    await syncMembershipPayments();
    await syncMembershipResponses();

    // Optionally update existing members (comment out if not needed)
    // await updateAllMembers();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(`Full sync completed in ${duration}s`);
}

// To run the sync manually (for testing purposes)
// Uncomment the function you want to run:
if (require.main === module) {
    (async () => {
        try {
            // Choose one or combine as needed:
            await syncMembersWithDatabase();     // Only add new members (fast)
            await syncMembershipPayments();      // Only sync payments
            await syncMembershipResponses();     // Only sync form responses

            // Or run everything at once:
            // await fullSync();                 // Add new members + sync payments + responses

            // Uncomment if you need to update existing member data:
            // await updateAllMembers();         // Update all existing members
        } catch (error) {
            console.error("Error syncing members:", error);
        }
    })();
}
