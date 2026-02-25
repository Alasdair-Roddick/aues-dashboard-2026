---
name: pr-review
description: Perform a thorough pull request review by analysing git diffs and explaining every change in plain language.
user-invokable: true
---

# PR Review Skill

A structured pull request review that explains changes in plain language, assesses quality,
and gives actionable feedback. The goal is to make the reviewer (or the author) fully
understand every change — not just that the code changed, but *why* it changed and whether
it's the right change.

---

## Phase 1 — Get the Diff

Obtain the diff through one of these methods (in priority order):

1. **User pasted a diff** — use it directly
2. **In a git repo** — run: `git diff main...HEAD` or `git diff <base>..<head>` depending on context
   - If unsure of branch names, run `git branch` and `git log --oneline -10` first
3. **Specific files** — run: `git diff <branch> -- path/to/file`
4. **Staged changes** — run: `git diff --cached`
5. **Ask the user** — if none of the above work, ask them to paste the diff or provide branch names

Also collect context:
- `git log --oneline -5` to see recent commit messages
- Any PR description, ticket, or context the user can share

---

## Phase 2 — Parse and Categorise Changes

Read the full diff and group changes into categories:

- **New features** — net new functionality
- **Bug fixes** — correcting incorrect behaviour
- **Refactors** — restructuring without behaviour change
- **Configuration changes** — env vars, build config, dependencies
- **Tests** — additions or changes to test files
- **Documentation** — comments, READMEs, docstrings
- **Deletions** — removed code or files
- **Dependency updates** — package.json, requirements.txt, etc.

Note the scale: how many files, how many lines added/removed.

---

## Phase 3 — Write the Review

Structure the review as follows:

---

### PR Review: `<branch name or description>`
**Date:** YYYY-MM-DD
**Scale:** X files changed, +Y insertions, −Z deletions

---

#### 📋 Overview
2–4 sentence plain-English summary of what this PR does overall and why it exists
(infer from the changes if no description is provided).

---

#### 🔍 Change-by-Change Breakdown

For each logical group of changes (not necessarily file-by-file — group related changes):

```
### <Descriptive title of the change>
**Files:** `path/to/file.js`, `path/to/other.js`
**Type:** New feature / Bug fix / Refactor / etc.

**What changed:**
Plain description of the code change — what was added, removed, or modified.

**Why it was changed:**
Your best assessment of the reason for the change. Be specific. If it's obvious from
context, say so. If it's unclear, flag it.

**Quality notes:**
Any observations about the quality of this specific change — good patterns used,
potential issues, anything worth discussing.
```

Repeat for each logical group.

---

#### ✅ What's Good
Specific callouts of well-done things — good abstractions, clean naming, solid test coverage,
thoughtful error handling, etc. Be specific, not generic.

---

#### ⚠️ Concerns / Questions
Issues that need to be discussed or addressed. Categorise each as:
- `[BLOCKING]` — must be resolved before merge
- `[SUGGESTION]` — recommended improvement but not required
- `[QUESTION]` — needs clarification, may or may not be an issue

For each concern:
```
**[BLOCKING/SUGGESTION/QUESTION]** Brief title
- Location: `file.js:42`
- Issue: clear description of the concern
- Suggestion: what to do about it (if applicable)
```

---

#### 🧪 Testing Assessment
- Are the changes adequately tested?
- Are there obvious cases not covered by tests?
- Do existing tests still make sense given the changes?

---

#### 📊 Overall Assessment

One of:
- ✅ **Approve** — looks good, ready to merge
- 🔄 **Approve with suggestions** — minor things to consider but not blocking
- 🔁 **Request changes** — blocking issues that must be resolved first

Brief 2–3 sentence justification for the verdict.

---

## Phase 4 — Save the Review (Optional)

If the user wants to save the review or the diff is substantial, offer to save it:

**File path:** `./PRReviews/<branch-name>_<YYYY-MM-DD>.md`

Ask: "Would you like me to save this review to `./PRReviews/`?"

---

## Rules

- **Explain intent, not just mechanics.** "This adds null checking before the DB call to prevent
  crashes on empty input" is better than "This adds an if statement."
- **Be specific about locations.** Always reference file names and line numbers for concerns.
- **Separate signal from noise.** Small style nits should be `[SUGGESTION]`, not `[BLOCKING]`.
- **Give credit.** Good PRs deserve positive feedback, not just a list of problems.
- **Stay objective.** Don't assume bad intent — prefer "this could cause X" over "this is wrong."
- **If the diff is very large (500+ lines)**, offer to review section by section and ask the
  user which files or areas to prioritise.
- **If no diff is available**, ask the user clearly for one before proceeding.