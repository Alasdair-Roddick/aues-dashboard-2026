---
name: git-commit
description: Stage all changes and create a properly formatted git commit with the correct conventional commit type. Use this skill whenever the user wants to commit code. Always runs git add . first, inspects the diff, and writes a message in conventional commit format.
user-invokable: true
---

# Git Commit Skill

Stage everything, inspect what actually changed, pick the right commit type, write a clear
message, and commit. No guessing — always read the diff before writing the message.

---

## Phase 1 — Stage and Inspect

Run in order:

```bash
git add .
git diff --cached --stat
git diff --cached
```

Read the full staged diff. Understand every change before forming a commit message.

Also check:
```bash
git log --oneline -3
```
To understand the recent commit style and scope used in this repo.

---

## Phase 2 — Determine the Commit Type

Pick **one** type based on what the diff actually contains. When in doubt, use the most
significant change as the primary type.

| Type | When to use |
|------|-------------|
| `feat` | A new feature or capability is added |
| `fix` | A bug, crash, or incorrect behaviour is corrected |
| `refactor` | Code restructured with no behaviour change |
| `chore` | Build process, tooling, config, dependencies, scripts |
| `docs` | Documentation, comments, READMEs only |
| `style` | Formatting, whitespace, semicolons — no logic change |
| `test` | Adding or updating tests only |
| `perf` | Performance improvements |
| `revert` | Reverting a previous commit |
| `ci` | CI/CD pipeline changes |

**When there are mixed changes:** pick the type of the *most impactful* change. Mention the
secondary changes in the body.

---

## Phase 3 — Write the Commit Message

Follow this format:

```
<type>(<scope>): <short imperative summary>

<body — what changed and why, wrapped at 72 chars>

<footer — breaking changes, issue refs (optional)>
```

**Rules for the summary line:**
- Imperative mood: "add X" not "added X" or "adds X"
- No capital letter after the colon
- No period at the end
- Under 72 characters total
- `scope` is optional — use it if the change is clearly scoped to one module/area (e.g. `feat(auth):`, `fix(api):`)

**Rules for the body (include if the change isn't obvious):**
- Explain *what* changed and *why*, not *how*
- Wrap at 72 characters
- Separate from subject with a blank line

**Examples:**
```
feat(auth): add JWT refresh token rotation

Refresh tokens now rotate on each use to limit exposure window.
Previous token is invalidated immediately on rotation.
```

```
fix: prevent crash when user list is empty

Index access on empty array caused unhandled exception on first load.
Added guard clause before processing user data.
```

```
chore: update dependencies to latest minor versions
```

---

## Phase 4 — Confirm with User

Present the proposed commit before running it:

```
## 📝 Proposed Commit

git add . ✅

**Type:** feat
**Message:**

feat(auth): add JWT refresh token rotation

Refresh tokens now rotate on each use to limit exposure window.
Previous token is invalidated immediately on rotation.

**Changed:** 3 files, +47 −12

Shall I run this commit? (yes / edit message)
```

If the user wants to edit — take their changes and re-present before committing.

---

## Phase 5 — Commit

Once confirmed, run:

```bash
git commit -m "<subject>" -m "<body>"
```

Or for simple single-line commits:
```bash
git commit -m "<subject>"
```

Then confirm success:
```
## ✅ Committed

<hash> feat(auth): add JWT refresh token rotation
```

---

## Rules

- **Always `git add .` first.** Never commit without staging everything.
- **Always read the diff before picking a type.** Never guess from the user's description alone.
- **Always confirm before committing.** One accidental commit to main is one too many.
- **One type per commit.** If the changes are truly mixed (e.g. feat + fix), note the secondary
  type in the body, not the subject.
- **If nothing is staged after `git add .`**, tell the user there's nothing to commit and show
  `git status`.
- **If there are untracked files the user might not want committed** (e.g. `.env`, large files,
  build artifacts not in `.gitignore`), flag them before confirming.