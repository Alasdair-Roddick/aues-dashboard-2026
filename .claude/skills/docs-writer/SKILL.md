---
name: docs-writer
description: Write or update comprehensive code documentation including inline comments, JSDoc/docstrings, API docs, architecture docs, and guides. Always reads the actual code before writing docs — never fabricates behaviour. Saves all standalone docs to ./docs/<DocName>.md.
user-invokable: true
---

# Documentation Writer Skill

Write documentation that explains what code actually does — not what you'd hope it does.
Every doc is grounded in reading the real code first.

---

## Phase 1 — Understand the Scope

Determine what kind of documentation is needed. Ask if unclear.

| Type | When to use |
|------|-------------|
| **Inline comments** | Code logic that isn't self-evident from naming alone |
| **JSDoc / docstrings** | Functions, classes, methods — parameters, return values, types |
| **API docs** | Endpoints, request/response shapes, auth, error codes |
| **Architecture doc** | How the system is structured, why decisions were made |
| **Module / file doc** | What a file or module does and how to use it |
| **Setup / guide** | How to do a specific thing (deploy, configure, extend) |
| **Changelog** | What changed between versions |

Multiple types may be needed. Confirm with the user before proceeding.

---

## Phase 2 — Read the Code

Read every file relevant to the documentation task:

- For **inline/docstring docs**: read the specific file(s) to document
- For **API docs**: read route files, controllers, middleware, and any validation schemas
- For **architecture docs**: read entry points, folder structure, config, key services
- For **module docs**: read the module and its public interface
- For **guides**: read the code path that implements the thing being guided

While reading, note:
- What each function/class/module **actually** does (not what its name implies)
- Parameters and their types, including optional ones and defaults
- Return values and their shapes
- Error cases and what triggers them
- Side effects (DB writes, network calls, state mutations)
- Any non-obvious logic that genuinely needs explanation
- Existing docs/comments that are accurate vs. stale

---

## Phase 3 — Flag Stale or Missing Docs

If updating existing docs, surface what needs to change:

```
## 📋 Documentation Audit

**Accurate — keeping as-is:** `processUser()` docstring is correct
**Stale — needs updating:** `fetchData()` still references removed `cache` param
**Missing entirely:** `validateSchema()` has no docs, `AuthService` class is undocumented
**Misleading comments:** Line 42 comment says "returns array" but function returns object
```

Ask the user if they want to fix stale/misleading docs in addition to adding new ones.

---

## Phase 4 — Write the Documentation

### Inline Comments

Only comment what isn't obvious from the code itself. Explain *why*, not *what*.

```js
// Bad: increment counter
count++;

// Good: offset by 1 because the API uses 1-based pagination
count++;
```

Place comments:
- Above complex logic blocks
- Above non-obvious conditionals
- Beside magic numbers or strings (or better — extract them to named constants)
- Above workarounds (always explain why the workaround exists)

---

### JSDoc (JavaScript/TypeScript)

```js
/**
 * Fetches a paginated list of users from the database.
 *
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (1-indexed)
 * @param {number} [options.limit=20] - Results per page
 * @param {string} [options.role] - Filter by user role
 * @returns {Promise<{users: User[], total: number}>} Paginated result
 * @throws {DatabaseError} If the database connection fails
 *
 * @example
 * const result = await getUsers({ page: 1, limit: 10, role: 'admin' });
 */
```

Rules:
- Always document params, return type, and thrown errors
- Include `@example` for any function with non-obvious usage
- For TypeScript, types in JSDoc are optional if already typed — focus on descriptions
- Don't document trivial getters/setters unless the behaviour is surprising

---

### Python Docstrings (Google style)

```python
def fetch_users(page: int, limit: int = 20, role: str = None):
    """Fetch a paginated list of users from the database.

    Args:
        page: Page number, 1-indexed.
        limit: Number of results per page. Defaults to 20.
        role: Optional role filter. If None, returns all roles.

    Returns:
        A dict with keys 'users' (list of User objects) and 'total' (int).

    Raises:
        DatabaseError: If the database connection fails.

    Example:
        result = fetch_users(page=1, limit=10, role='admin')
    """
```

---

### API Documentation

Save to `./docs/API.md`. Template:

```markdown
# API Reference

## Authentication
How to authenticate (bearer token, API key, session, etc.)

---

## Endpoints

### GET /users
Returns a paginated list of users.

**Query Parameters**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| page | integer | No | Page number (default: 1) |
| limit | integer | No | Results per page (default: 20) |
| role | string | No | Filter by role |

**Response 200**
```json
{
  "users": [{ "id": "abc123", "name": "Jane", "role": "admin" }],
  "total": 142
}
```

**Errors**
| Status | Code | Description |
|--------|------|-------------|
| 401 | UNAUTHORIZED | Missing or invalid token |
| 422 | VALIDATION_ERROR | Invalid query parameters |
```

---

### Architecture Documentation

Save to `./docs/ARCHITECTURE.md`. Template:

```markdown
# Architecture

## Overview
2–3 sentences on what the system does and its key architectural characteristics.

## System Diagram
(ASCII or description of components and how they connect)

## Key Components

### Component Name
- **Purpose:** what it does
- **Location:** `src/services/`
- **Key files:** list
- **Interfaces with:** what it depends on / is depended on by

## Data Flow
Describe the main data flows through the system.

## Key Design Decisions
### Decision: Why we chose X over Y
Context, options considered, and reasoning.

## Infrastructure
How the system is deployed and hosted.
```

---

### Module / File Documentation

Add a file header comment:

```js
/**
 * @module UserService
 *
 * Handles all user lifecycle operations: creation, authentication,
 * profile updates, and deletion. Interfaces with the database via
 * UserRepository and fires events via EventBus on state changes.
 *
 * @see AuthService for token management
 * @see UserRepository for data access
 */
```

---

## Phase 5 — Present and Confirm

For **inline/docstring docs** — show a diff-style preview of additions:
```
## 📝 Documentation Preview

I'll add/update docs in these locations:
- `src/services/user.js` — JSDoc for 4 functions, 1 file header
- `src/utils/validation.js` — inline comments in validateSchema()

Here's a sample:

[show 1-2 examples of the most significant docs being added]

Shall I apply all changes?
```

For **standalone doc files** — show the full content in the conversation first, then save to `./docs/`.

---

## Phase 6 — Save

- **Inline/docstring docs**: edit the source files directly
- **Standalone docs**: save to `./docs/<DocName>.md`
  - API docs → `./docs/API.md`
  - Architecture → `./docs/ARCHITECTURE.md`
  - Guides → `./docs/<Topic>_Guide.md`
  - Module docs → `./docs/<ModuleName>.md`

Create the `./docs/` directory if it doesn't exist.

Confirm what was saved:
```
## ✅ Documentation Complete

**Inline docs added:**
- `src/services/user.js` — JSDoc for getUserById, createUser, updateUser, deleteUser

**Files saved:**
- `./docs/API.md`
- `./docs/ARCHITECTURE.md`
```

---

## Rules

- **Read the code before writing.** Documentation that contradicts the code is worse than no docs.
- **Explain why, not what.** Good code explains what it does. Good docs explain why.
- **Don't document the obvious.** `// set name to name` is noise. Skip it.
- **Flag stale docs.** If existing comments are wrong, update or remove them — don't leave them alongside correct new docs.
- **Real types and examples only.** Copy actual types and values from the code — never invent example shapes.
- **Keep docs close to the code.** Inline docs in the file beat a separate doc that drifts.
- **If the code is hard to document**, that's usually a signal it's hard to understand — mention this to the user.