# Rubric API Integration

This module handles syncing member data from the Rubric API to your PostgreSQL database.

## Performance

- **Old approach**: ~2 minutes (individual inserts/updates for 2,329 members)
- **New approach**: ~3.5 seconds when no new members exist
- **Optimization**: ~97% faster! 🚀

## Functions

### `fetchMembersFromRubric()`

Fetches all members from the Rubric API.

**Returns**: `Promise<Member[]>`

### `syncMembersWithDatabase()`

**Fast** - Only adds NEW members that don't exist in the database.

**Performance**:

- Fetches all existing emails in one query
- Uses a Set for O(1) lookup
- Batch inserts all new members at once
- **Use this for most operations** ✅

**Example**:

```typescript
import { syncMembersWithDatabase } from "./app/lib/rubric";
await syncMembersWithDatabase();
```

### `updateAllMembers()`

Updates all existing members in the database with fresh data from Rubric.

**Performance**:

- Fetches all existing members once
- Updates in batches of 100 using Promise.all
- Shows progress as it updates

**Use when**: You need to refresh existing member data (e.g., membership status changed)

**Example**:

```typescript
import { updateAllMembers } from "./app/lib/rubric";
await updateAllMembers();
```

### `syncMembershipPayments()`

Syncs payment records for members.

**Performance**:

- Maps members to their database IDs
- Avoids duplicate payments using memberId + transactionId
- Batch inserts all new payments at once

**What it does**:

- Creates payment records based on member data
- Sets status to "completed" if membership is valid, "pending" otherwise
- Uses membershipId as the transactionId

**Example**:

```typescript
import { syncMembershipPayments } from "./app/lib/rubric";
await syncMembershipPayments();
```

### `syncMembershipResponses()`

Syncs form response data for members.

**Performance**:

- Fetches members with response data
- Avoids duplicate responses (one per member)
- Batch inserts all new responses at once

**What it does**:

- Stores the full form responses object (JSONB)
- Contains fields like: Student Number, Gender, Study Year, Degree, etc.

**Example**:

```typescript
import { syncMembershipResponses } from "./app/lib/rubric";
await syncMembershipResponses();
```

### `fullSync()`

Runs complete sync: members + payments + responses.

**What it does**:

1. Adds new members
2. Syncs payment records
3. Syncs form responses
4. (Optional) Updates existing members

**Example**:

```typescript
import { fullSync } from "./app/lib/rubric";
await fullSync();
```

## Running Manually

```bash
# Add new members only (recommended - fastest)
npx tsx app/lib/rubric.ts

# Edit the file to run different operations:
# - syncMembersWithDatabase() - add new members
# - updateAllMembers() - update existing members
# - fullSync() - add new + update existing
```

## Usage in Your App

For a typical member listing page, you'll want to:

1. **On page load**: Just fetch from database (instant)
2. **Background sync**: Optionally run `syncMembersWithDatabase()` in the background
3. **Manual refresh button**: Let users trigger `syncMembersWithDatabase()` if needed

```typescript
// In your API route or server action
import { syncMembersWithDatabase, fullSync } from "@/app/lib/rubric";
import { db } from "@/app/db";
import { members, membershipPayments, membershipResponses } from "@/app/db/schema";
import { eq } from "drizzle-orm";

// GET /api/members - just fetch from DB (fast!)
export async function GET() {
  const allMembers = await db.select().from(members);
  return Response.json(allMembers);
}

// GET /api/members/:id - get member with payments and responses
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const memberId = parseInt(params.id);

  const [member] = await db.select().from(members).where(eq(members.id, memberId));
  const payments = await db
    .select()
    .from(membershipPayments)
    .where(eq(membershipPayments.memberId, memberId));
  const [responses] = await db
    .select()
    .from(membershipResponses)
    .where(eq(membershipResponses.memberId, memberId));

  return Response.json({
    ...member,
    payments,
    formResponses: responses?.responses,
  });
}

// POST /api/members/sync - trigger a sync (members only)
export async function POST() {
  await syncMembersWithDatabase();
  return Response.json({ success: true });
}

// POST /api/members/full-sync - trigger a full sync (members + payments + responses)
export async function POST() {
  await fullSync();
  return Response.json({ success: true });
}
```

## Environment Variables

Set these in your `.env` file:

```bash
# Required
DATABASE_URL="postgresql://..."

# Optional (defaults shown)
RUBRIC_API_URL="https://appserver.getqpay.com:9090/AppServerSwapnil/getSocietyPortalMembershipList"
RUBRIC_SESSION_ID="societyid_6899_2ce61a07-26be-4a8c-a763-7df615dfd5e7"
RUBRIC_EMAIL="club@aues.com.au"
```

## Data Mapping

API Field → Database Field

- `membershipid` → `id`
- `fullname` → `fullname`
- `email` → `email`
- `phonenumber` → `phonenumber` (converts "N/A" to null)
- `membershipid` → `membershipId` (as string)
- `membershiptype` → `membershipType`
- `pricepaid` → `pricePaid` (strips "$" and converts to numeric string)
- `paymentmethod` → `paymentMethod`
- `isvalid` → `isValid` (converts 1 to true)
- `created` → `createdAt`
- `updated` → `updatedAt`
