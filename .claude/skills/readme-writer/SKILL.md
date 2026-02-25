---
name: readme-writer
description: Write a new README.md or update an existing one based on the actual codebase. Use this skill whenever the user wants to create or update a README. Always reads the codebase and existing README (if any) before writing — never generates generic boilerplate.
user-invokable: true
---

# README Writer Skill

Write or update a README that actually reflects the project — not generic boilerplate.
Every section should be grounded in what the code really does.

---

## Phase 1 — Read the Codebase

Before writing anything, explore the project:

```bash
ls -la
cat package.json        # or requirements.txt, Cargo.toml, go.mod, etc.
git log --oneline -10   # recent commit history for project context
```

Read:
- Entry point files (main, index, app, server, etc.)
- Config files (`.env.example`, `docker-compose.yml`, config dirs)
- Existing README if one exists
- Any existing docs folder
- Key source files to understand what the project actually does

Identify:
- **What the project does** — its purpose in one sentence
- **Tech stack** — languages, frameworks, key dependencies
- **How it's run** — install steps, start commands, environment setup
- **Key features** — what it can actually do
- **Project structure** — how the folders/files are organised
- **Any APIs, CLIs, or interfaces** exposed

---

## Phase 2 — Check for Existing README

**If a README exists:**
- Read it fully
- Note what's accurate, what's outdated, what's missing
- Present a gap analysis to the user:
```
## 📋 Existing README Analysis

**Accurate and keeping:** ...
**Outdated / needs updating:** ...
**Missing entirely:** ...

Shall I update it in place, or rewrite from scratch?
```
Wait for the user's preference before proceeding.

**If no README exists:**
- Confirm the project name and any context the user wants to add
- Proceed to write from scratch

---

## Phase 3 — Confirm Scope

Ask the user (keep it brief — one message):
- Any sections they specifically want included or excluded?
- Target audience — developers, end users, both?
- Should it include badges (build status, version, license)?
- Is there anything the codebase doesn't make obvious (e.g. why it was built, who it's for)?

---

## Phase 4 — Write the README

Build the README from the sections below. Include only the sections that are relevant —
don't add empty or placeholder sections just to fill space.

---

### README Template

```markdown
# Project Name

> One-sentence description of what this project does and who it's for.

<!-- Optional: badges -->
![License](https://img.shields.io/badge/license-MIT-blue)

---

## What It Does
2–4 sentences. What problem does it solve? What does it produce or enable?
Only include if not obvious from the name/tagline.

---

## Features
- Concrete feature 1
- Concrete feature 2
(only include if there are multiple distinct capabilities worth highlighting)

---

## Tech Stack
- **Language:** X
- **Framework:** Y
- **Key dependencies:** Z

---

## Getting Started

### Prerequisites
What needs to be installed first and at what version.

### Installation
```bash
git clone ...
cd project
npm install        # or pip install -r requirements.txt, etc.
cp .env.example .env
```

### Configuration
Any environment variables that need to be set, with explanations.
Reference `.env.example` if it exists.

### Running
```bash
npm run dev        # development
npm start          # production
```

---

## Usage
How to actually use the project once it's running. Include examples.
For CLIs: show command examples.
For APIs: show a request/response example.
For libraries: show a code snippet.

---

## Project Structure
```
src/
├── controllers/   # request handlers
├── services/      # business logic
├── models/        # data layer
└── routes/        # API route definitions
```
Only include if the structure isn't obvious or needs explanation.

---

## API Reference
If the project exposes an API, document the key endpoints.
(Or link to separate API docs if they exist.)

---

## Running Tests
```bash
npm test
npm run test:coverage
```

---

## Deployment
Key steps or gotchas for deploying to production, if relevant.

---

## Contributing
How to contribute — branch naming, PR process, code style.
Keep brief or link to CONTRIBUTING.md if it exists.

---

## License
State the license. Check package.json or LICENSE file.
```

---

## Phase 5 — Review Before Saving

Present the full README in the conversation first. Ask:

```
## 📄 Draft README

<full content>

---

Happy with this? I'll save it to `README.md`.
Any sections to add, remove, or change?
```

---

## Phase 6 — Save

Once approved, write to `./README.md` (overwriting if updating).

Confirm:
```
## ✅ README saved to ./README.md
```

---

## Rules

- **Read the code first.** Every claim in the README must be grounded in what the code actually does.
- **No placeholder sections.** If there are no tests, don't add a "Running Tests" section with TBD.
- **Real commands only.** Copy install/run commands from package.json scripts or observed usage — never invent them.
- **Match the project's tone.** A serious enterprise tool gets professional prose. A weekend project can be casual.
- **Keep it scannable.** Developers skim READMEs. Lead with the most useful info.
- **If updating**, preserve any content that's still accurate — don't rewrite for the sake of rewriting.