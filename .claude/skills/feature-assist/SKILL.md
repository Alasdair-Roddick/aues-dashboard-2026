---
name: feature-assist
description: Brainstorm, explore, and design features collaboratively before any implementation begins. Use this skill whenever a user wants to add a feature, explore an idea, plan new functionality, or figure out the best way to build something. Triggers on phrases like "I want to add...", "how should I build...", "can we add a feature for...", "I'm thinking about adding...", "what's the best way to implement...", "feature idea", or any request to design or plan new functionality. Never write implementation code — this skill is exclusively for exploration and design. Always save the result to ./potentialFeatures/<Feature_Name>_Idea.md.
---

# Feature Assist Skill

This skill helps users think through a feature deeply before a single line of code is written.
The goal is to arrive at the *best* design for the codebase — not just a design that works.
Never implement. Never write production code. Explore, challenge, and refine.

---

## Phase 1 — Understand the Codebase

Before discussing the feature, get oriented in the codebase.

1. List and read key files: entry points, core modules, existing patterns, config files.
2. Identify:
   - **Architecture style**: MVC, functional, microservices, monolith, etc.
   - **Key abstractions**: what are the main data models, services, or components?
   - **Existing conventions**: naming, folder structure, error handling patterns, test style
   - **Relevant existing features**: anything similar that already exists that the new feature could extend or mirror
3. Note anything that will constrain or enable the proposed feature.

---

## Phase 2 — Understand the Feature Request

Ask clarifying questions to fully understand what the user wants. Don't assume.

Questions to explore (pick the most relevant, don't fire all at once):
- What problem does this feature solve for the user?
- Who is the end user of this feature?
- What does success look like — what should be possible after this is built?
- Are there any known constraints (performance, backwards compatibility, API limits)?
- Is there a rough idea of scope — small addition, medium feature, major change?
- Any existing inspiration (other apps, design mockups, prior attempts)?

Listen to the answers and update your understanding before moving to brainstorming.

---

## Phase 3 — Brainstorm Approaches

Generate **2–4 distinct implementation approaches** for the feature. These should be
meaningfully different — not just variations on the same idea.

For each approach, cover:
- **Summary**: one-paragraph description of the approach
- **How it fits the codebase**: what existing code it builds on or changes
- **Pros**: what makes this approach good
- **Cons / risks**: complexity, performance, maintenance burden, breaking changes
- **Estimated effort**: Small / Medium / Large

Present these to the user clearly. Discuss tradeoffs. Ask which direction resonates.

---

## Phase 4 — Refine and Recommend

Based on the user's feedback, converge on a preferred approach. Then go deeper:

- Identify the specific files and functions that would need to change
- Identify new files or modules that would need to be created
- Surface any edge cases or gotchas that need to be designed for upfront
- Highlight any decisions that still need to be made (data shape, API design, UX flows)
- Give a clear recommendation with reasoning if the user is undecided

Do NOT write implementation code. Pseudocode or structural outlines are OK if they help
illustrate the design.

---

## Phase 5 — Save the Feature Idea

Once the user is happy with the direction, save the design to disk.

**File path:** `./potentialFeatures/<Feature_Name>_Idea.md`

Use this template:

```markdown
# Feature Idea: <Feature Name>
**Date:** YYYY-MM-DD
**Status:** Idea / Ready to Implement
**Requested by:** (if known)

---

## Problem Statement
What problem does this feature solve?

---

## Feature Description
Clear description of what the feature does from a user perspective.

---

## Codebase Context
- **Architecture fit:** how this fits the existing structure
- **Key existing files:** files this will touch or build on
- **Relevant patterns:** conventions to follow

---

## Chosen Approach
Full description of the agreed-upon implementation approach.

### Why this approach
Reasoning for choosing this over alternatives.

### Files to change
- `path/to/file.js` — what changes and why
- `path/to/newfile.js` — new file, what it contains

### New files to create
- `path/to/new/module.js` — purpose

### Edge cases to handle
- Edge case 1
- Edge case 2

---

## Alternatives Considered
### Option A — Name
Brief description. Rejected because: ...

### Option B — Name
Brief description. Rejected because: ...

---

## Open Questions
- [ ] Any unresolved design decisions

---

## Notes
Any other context, links, references, or discussion.
```

After saving, confirm the path and tell the user they can use the **implement-feature** skill
to turn this plan into working code.

---

## Rules

- **Never write implementation code.** Pseudocode to illustrate structure is OK.
- **Always read the codebase first** — feature design should fit the existing patterns.
- **Challenge the request if needed.** If there's a simpler way, say so.
- **One feature per file.** Don't bundle multiple features into one idea file.
- **If the user is vague**, ask enough questions to write a meaningful plan — don't design in a vacuum.