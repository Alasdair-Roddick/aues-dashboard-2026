---
name: implement-feature
description: Implement a planned feature from a ./potentialFeatures idea file into working code.
user-invokable: true
---

# Implement Feature Skill

This skill takes a finished feature idea file from `./potentialFeatures/` and turns it into
working, well-integrated code. The key discipline: read and validate the plan before writing
anything, flag stale assumptions, then implement cleanly.

---

## Phase 1 — Load the Feature Plan

1. Check `./potentialFeatures/` and list available idea files if the user hasn't specified one.
2. Read the relevant `<Feature_Name>_Idea.md` file in full.
3. Confirm with the user which feature to implement if there's any ambiguity.

Show a brief summary of what you've loaded:
```
## 📋 Loaded Feature Plan: <Feature Name>
- Approach: one sentence summary
- Files to change: list
- Files to create: list
- Open questions: any unresolved items flagged in the plan
```

---

## Phase 2 — Validate Against Current Codebase

Plans go stale. Before implementing, verify the plan still matches reality.

1. Read each file listed in the plan's "Files to change" section.
2. Check:
   - Do the files still exist at the expected paths?
   - Do the functions/classes mentioned still exist and have the expected signatures?
   - Have any relevant dependencies changed?
   - Are there any new files or patterns that weren't there when the plan was written that
     the implementation should follow?
3. Note any **drift** between the plan and the current state.

If drift is found, flag it:
```
## ⚠️ Plan Drift Detected
- `path/to/file.js` — function `handleX` was renamed to `processX`
- `path/to/other.js` — no longer exists, logic moved to `newpath/file.js`

Updating implementation plan accordingly...
```

Update your internal implementation plan to account for drift. If drift is significant,
ask the user whether to proceed with the adjusted plan or revisit the feature design first.

---

## Phase 3 — Create an Implementation Checklist

Before writing code, lay out the exact implementation steps as a checklist.

```
## 🛠️ Implementation Plan

- [ ] Step 1: Create `src/services/newService.js` with X, Y, Z
- [ ] Step 2: Add `handleFeature()` to `src/controllers/main.js`
- [ ] Step 3: Update `src/routes/index.js` to wire up new route
- [ ] Step 4: Add types to `src/types/index.ts`
- [ ] Step 5: Write tests in `tests/newService.test.js`
```

Ask the user: "Does this look right? Any adjustments before I start?"

---

## Phase 4 — Implement Step by Step

Work through the checklist one step at a time.

**For each step:**
1. State what you're about to do
2. Write the code
3. Check off the step
4. Briefly explain key decisions made during the step (e.g., "I used X pattern here to
   match the existing Y convention in the codebase")

**Code quality rules:**
- Match the existing codebase's style, naming, and patterns exactly
- Don't refactor unrelated code — stay focused on the feature
- If you notice a bug or issue in existing code while implementing, note it but don't fix it
  (suggest using the debug-files skill separately)
- Add comments only where the logic is genuinely non-obvious
- Follow the error handling pattern already used in the codebase

**If a step reveals an unexpected problem:**
- Stop
- Explain what was found
- Propose an adjusted approach
- Get user confirmation before continuing

---

## Phase 5 — Summary and Handoff

After all steps are complete:

1. **Update the idea file** — change `Status: Idea / Ready to Implement` to `Status: Implemented`
   and add an implementation notes section at the bottom:

```markdown
---

## Implementation Notes
**Implemented:** YYYY-MM-DD
**Files changed:**
- `path/to/file.js` — description of changes
- `path/to/newfile.js` — created, purpose

**Deviations from plan:**
- Any places where implementation differed from the design and why

**Suggested next steps:**
- Any follow-up work, cleanup, or testing recommended
```

2. **Present a summary to the user:**
```
## ✅ Feature Implemented: <Feature Name>

**Changed files:**
- `path/to/file.js` — what changed
- `path/to/newfile.js` — created

**Deviations from plan:** none / or brief list

**Recommended next steps:**
- Run tests: `npm test` / `pytest` / etc.
- Any manual testing steps
- Any follow-up tasks
```

---

## Rules

- **Always read the idea file first.** Never implement from memory or the user's verbal description alone.
- **Always validate against the codebase.** Plans go stale.
- **Always get checklist approval before implementing.** One surprise is better than ten.
- **Match existing conventions.** The feature should look like it always belonged in the codebase.
- **Update the idea file when done.** Keep the potentialFeatures folder as a living record.
- **Don't fix unrelated issues.** Stay in scope; flag and defer other problems.