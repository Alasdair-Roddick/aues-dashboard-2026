# Debug Plan: auth.ts — `randomUUID` import fails

**Date:** 2026-02-25
**Files Affected:** `auth.ts`

---

## Summary of Issues Found

The bare `import { randomUUID } from "crypto"` resolves to a deprecated npm stub package
(`node_modules/crypto` v1.0.1) that exports nothing, instead of the Node.js built-in. With
`"moduleResolution": "bundler"` in tsconfig.json, Turbopack prefers the npm package over
the Node.js built-in, causing the ECMAScript error at line 8.

---

## Issues

### Issue 1 — [CRITICAL] `crypto` npm stub shadows Node.js built-in

- **Location:** `auth.ts:8`
- **Root Cause:** `node_modules/crypto` is a deprecated npm stub (no exports). Bundler
  resolves `"crypto"` to this package instead of the Node.js built-in.
- **Proposed Fix:** Change the import to use the `node:` prefix:
  ```ts
  import { randomUUID } from "node:crypto";
  ```
  The `node:` protocol forces resolution directly to the Node.js built-in, bypassing any
  npm package with the same name.
- **Risk:** Low — `node:crypto` is supported in Node.js 14.18+ and Next.js server-side
  code. `auth.ts` is purely server-side so there is no browser-bundle concern.

---

## Implementation Order

1. Update `auth.ts` line 8: `"crypto"` → `"node:crypto"`

---

## Alternatives Considered

- **Option A (chosen) — `node:crypto` prefix:** Minimal, explicit, zero-risk change. Works
  in all modern Node.js and Next.js versions.
- **Option B — use `globalThis.crypto.randomUUID()`:** Remove the import entirely and use
  the Web Crypto global. Also valid, but requires touching the usage site too and is slightly
  less explicit about server-only intent.
- **Option C — uninstall the `crypto` npm package:** Would also fix it, but is a destructive
  dependency change that could break other things if something explicitly depends on it.

---

## Open Questions

- None — the fix is unambiguous.
