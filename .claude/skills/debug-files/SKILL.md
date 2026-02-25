---
name: debug-files
description: Structured debugging workflow for files with errors, bugs, crashes, or unexpected behavior. Use this skill whenever the user wants to debug code, fix errors, trace a bug, investigate a crash, or diagnose unexpected behavior in any file or codebase. Triggers on phrases like "debug this", "fix the bug", "something's broken", "why isn't this working", "find the issue", "it's crashing", or any request that involves diagnosing and repairing file contents. Always use this skill before writing any fix — never jump straight to implementation.
---

# File Debugging Skill

A disciplined, think-before-you-act debugging workflow. The goal is to fully understand the
problem before writing a single line of fix. Rushing to implement causes regressions and
missed root causes.

---

## Phase 1 — Investigate: Find All Errors

Before forming any opinion about a fix, read the files carefully and gather evidence.

**Steps:**

1. Read every relevant file in full. If the user provides a file, start there.
2. List every problem you find — syntax errors, logic bugs, missing imports, type mismatches,
   off-by-one errors, race conditions, unreachable code, misconfigurations, etc.
3. For each problem, note:
   - **Location**: file name + line number or function
   - **Type**: syntax / logic / runtime / config / dependency / etc.
   - **Observed symptom**: what goes wrong because of this
   - **Suspected cause**: your hypothesis about root cause
4. Mark issues by severity: `[CRITICAL]`, `[WARNING]`, or `[INFO]`
5. Do NOT suggest fixes yet. This phase is observation only.

**Output format for this phase** (show to user):

```
## 🔍 Investigation Results

### Issue 1 — [CRITICAL] Brief title
- Location: `filename.py`, line 42, function `process_data`
- Type: Logic bug
- Symptom: Function returns None when input is empty list
- Root cause: Missing guard clause before accessing index 0

### Issue 2 — [WARNING] Brief title
...
```

---

## Phase 2 — Think: Reason About the Best Approach

Once all issues are catalogued, reason through the fix strategy. Do NOT write code yet.

**For each issue (or group of related issues), consider:**

- What is the minimal change that fixes the root cause without side effects?
- Are there multiple valid approaches? What are the tradeoffs?
- Could fixing this break something else? What downstream effects exist?
- Is there a deeper architectural issue that a surface fix would paper over?
- What is the correct order to fix things (some fixes may depend on others)?

**Consolidate into a fix plan:**

- Group related issues when one fix resolves multiple problems
- Sequence fixes in dependency order
- Flag any issues that require the user's input or a judgment call

---

## Phase 3 — Plan: Write a Structured Plan File

Before asking to implement, write the plan to disk.

**Create the plan file at:** `./Plan/DEBUG_<filename>_<YYYY-MM-DD>.md`

Use this template:

```markdown
# Debug Plan: <filename or brief description>

**Date:** YYYY-MM-DD
**Files Affected:** list of files

---

## Summary of Issues Found

Brief 2–3 sentence overview of what's wrong and why.

---

## Issues

### Issue 1 — [CRITICAL] Title

- **Location:** `file.py:42`
- **Root Cause:** ...
- **Proposed Fix:** ...
- **Risk:** Low / Medium / High — reason

### Issue 2 — [WARNING] Title

...

---

## Implementation Order

1. Fix Issue 2 first (unblocks Issue 1)
2. Fix Issue 1
3. Validate with ...

---

## Alternatives Considered

- **Option A (chosen):** ... — chosen because ...
- **Option B:** ... — rejected because ...

---

## Open Questions

- [ ] Any decisions that need user input before implementing
```

After writing the file, confirm it was saved and show the path.

---

## Phase 4 — Ask Permission to Implement

After the plan file is written, present a summary to the user and ask for approval:

```
## ✅ Debug Plan Ready

I've analysed the file and found [N] issue(s). Here's the plan:

**[CRITICAL] Issue title** — one sentence summary of fix
**[WARNING] Issue title** — one sentence summary of fix

**Why this approach:** One or two sentences justifying the strategy —
why this is the right fix, what alternatives were rejected and why.

**Estimated risk:** Low/Medium/High — brief reason

📄 Full plan saved to: `./Plan/DEBUG_<filename>_<date>.md`

**Shall I implement this plan?** (yes / make changes to plan first)
```

Do NOT write any implementation code until the user confirms.

---

## Phase 5 — Implement

Only after explicit user approval:

1. Apply fixes in the planned order
2. After each fix, briefly note what was changed and why
3. If you discover a new issue during implementation, STOP — add it to the plan
   file and surface it to the user before continuing
4. After all fixes, provide a short summary of every change made

---

## Rules

- **Never implement before Phase 4 approval.** If tempted, re-read Phase 1.
- **One root cause per fix.** Don't bundle unrelated changes.
- **Update the plan file** if anything changes during implementation.
- **If the file cannot be read**, tell the user clearly and ask them to paste the content or upload it.
- **If the codebase is large**, focus on the files most likely related to the reported symptom first, then expand scope if the root cause isn't found.
- **Be honest about uncertainty.** If you're not sure what's causing a bug, say so in the plan and propose a diagnostic step before a fix.
