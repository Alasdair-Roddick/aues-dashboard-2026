# Code Review Warnings

Date: 2026-02-04

## Scope

- Static checks run:
  - Initial: `npm run lint` -> **44 errors**, **33 warnings**
  - Initial: `npx tsc --noEmit --incremental false` -> **8 errors**
  - Current: `npm run lint` -> **0 errors**, **30 warnings**
  - Current: `npx tsc --noEmit --incremental false` -> **0 errors**
- Manual review focused on authz/authn boundaries, data integrity, sync performance, and role-gated flows.

## Action Status

- ✅ 1) Admin server actions now enforce session/role checks.
- ✅ 2) Customization actions now enforce ownership/admin checks.
- ✅ 3) `getDecryptedSettings()` now enforces admin-only access.
- ✅ 4) `/admin` policy aligned to Admin-only (page + middleware + nav).
- ✅ 5) New-user password switched to generated temporary password.
- ✅ 6) `getAdminUsers()` now requires an authenticated session.
- ✅ 7) TypeScript errors fixed.
- ✅ 8) Lint **errors** fixed (warnings remain).
- ✅ 9) Squarespace settings cache now invalidates after settings update.
- ✅ 10) Squarespace item sync now batches deletes/inserts (reduced query count).
- ✅ 11) Debug logs removed from admin page/add-user helper.

## Critical

### 1) Privileged server actions are missing authorization guards

- Files:
  - `app/admin/actions.ts:9-127`
  - `app/admin/actions.ts:107-126`
- Issue:
  - `getAllUsersAction`, `addUserAction`, `updateUserAction`, `deleteUserAction`, and `getAllMembersAction` run DB reads/writes with **no auth or role checks**.
- Impact:
  - Any caller that can invoke these actions can enumerate users/members and perform admin-only mutations.
- Recommended fix:
  - Enforce `auth()` + strict role checks (`Admin`/`Treasurer` where appropriate) inside every action, not just at page level.

### 2) User customization actions allow cross-user reads/writes

- File: `app/actions/customizations.ts:7-13`, `app/actions/customizations.ts:32-60`
- Issue:
  - `getUserCustomizations(userId)` and `updateUserCustomizations(userId, ...)` trust caller-provided `userId` and do not validate session ownership or role.
- Impact:
  - A user can read or overwrite another user's theme/customization data.
- Recommended fix:
  - Derive `userId` from `auth()` session server-side and ignore client-provided identity unless caller is admin.

### 3) Secret-bearing settings helper is exported without auth checks

- File: `app/actions/settings.ts:96-119`
- Issue:
  - `getDecryptedSettings()` returns decrypted API credentials and has no authorization gate.
- Impact:
  - High risk of accidental secret exposure if this export is used from a client-bound action path.
- Recommended fix:
  - Restrict to internal module usage only (non-action module) or enforce strict admin authorization.

## High

### 4) Role access rules are inconsistent between middleware and page logic

- Files:
  - `middleware.ts:22-23`
  - `app/admin/page.tsx:19`
- Issue:
  - Middleware blocks `/admin` unless role is `Admin`, but `app/admin/page.tsx` allows `Admin` **or** `Treasurer`.
- Impact:
  - Treasurer users are redirected unexpectedly before page-level checks.
- Recommended fix:
  - Align policy in one source of truth (prefer middleware + server action checks).

### 5) Default password policy is weak and predictable

- File: `app/admin/actions.ts:37-40`
- Issue:
  - New users are created with password `${username}2026`.
- Impact:
  - Easy credential guessing and account compromise risk.
- Recommended fix:
  - Generate random temporary passwords, force reset on first login, and add password complexity rules.

### 6) Missing auth check in admin user lookup helper for receipts flow

- File: `app/actions/receipts.ts:156-170`
- Issue:
  - `getAdminUsers()` has no session/role validation.
- Impact:
  - Unauthorized caller can enumerate admin IDs/names.
- Recommended fix:
  - Require authenticated user and explicit role gate.

## Medium

### 7) TypeScript build is currently failing

- Failing refs from `npx tsc --noEmit --incremental false`:
  - `app/actions/squarespace.ts:283`, `app/actions/squarespace.ts:290`
  - `app/components/MemberChart.tsx:114`, `app/components/MemberChart.tsx:122`, `app/components/MemberChart.tsx:132`
  - `app/profile/components/appearance.tsx:76`
- Impact:
  - Type safety guardrail is broken; CI/release risk increases.
- Recommended fix:
  - Resolve all type errors before merge; add CI gate for `tsc --noEmit`.

### 8) Lint health regression across the codebase

- `npm run lint` reports 77 issues (44 errors, 33 warnings), including:
  - Multiple `no-explicit-any` violations
  - React effect/set-state rule violations
  - Unused imports/vars
- Impact:
  - Higher chance of runtime bugs and inconsistent code quality.
- Recommended fix:
  - Triage by severity and fix errors first; enforce lint in CI.

### 9) Squarespace settings cache can serve stale credentials/config

- Files:
  - `app/lib/squarespace.ts:50-57` (5-minute cache)
  - `app/lib/squarespace.ts:89-103` (cache invalidated only on last-order-date update)
  - `app/actions/settings.ts:53-87` (settings update path does not invalidate this cache)
- Impact:
  - Recently updated API key/URL/version may not apply immediately, causing confusing sync failures.
- Recommended fix:
  - Add explicit cache invalidation hook after settings updates.

### 10) Sync loop is N+1 query heavy for large order volumes

- File: `app/lib/squarespace.ts:314-365`
- Issue:
  - Per order: update/insert + delete items + insert items in a serial loop.
- Impact:
  - Slow syncs and timeout risk with large datasets.
- Recommended fix:
  - Batch operations (upserts + item replace in chunks/transactions), and avoid full item delete+reinsert when unchanged.

## Low

### 11) Production debug logging of user/role events

- Files:
  - `app/admin/page.tsx:16`, `app/admin/page.tsx:20`
  - `app/admin/lib/addUser.tsx:7-24`
- Impact:
  - Noisy logs and possible information leakage in shared environments.
- Recommended fix:
  - Remove or gate logs behind environment-aware debug flag.

## Testing Gap

- No test files were detected via `rg --files -g "*test*" -g "*spec*"`.
- Critical flows currently untested: authz boundaries, admin mutations, Squarespace sync, shipping updates, and polling reconciliation.
