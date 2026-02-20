# AUES Dashboard 2026

A modern dashboard application built with Next.js 16, TypeScript, and shadcn/ui for managing members, merchandise, and administrative tasks.

## Tech Stack

- **Framework:** Next.js 16.1.1 with React 19 and TypeScript 5
- **Styling:** TailwindCSS 4 with shadcn/ui components
- **Database:** PostgreSQL (Neon Serverless) with Drizzle ORM
- **UI Components:** Radix UI primitives with shadcn/ui
- **Icons:** Lucide React

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- PostgreSQL database (Neon Serverless recommended)
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd aues-dashboard-2026
```

2. Install dependencies:

```bash
bun add .
```

3. Set up environment variables:

```bash
cp .env.example .env
```

Add your database connection string to `.env`:

```
DATABASE_URL="your-neon-postgresql-connection-string"
```

4. Generate and run database migrations:

```bash
bun run db:generate
bun run db:migrate
```

5. Start the development server:

```bash
bun run dev
```

Open [http://localhost:5055](http://localhost:5055) with your browser to see the application.

### Docker Setup (Alternative)

For a containerized setup with Docker:

#### Prerequisites

- Docker
- Docker Compose

#### Quick Start with Docker

1. Clone the repository:

```bash
git clone <repository-url>
cd aues-dashboard-2026
```

2. Copy and configure environment variables:

```bash
cp .env.example .env
```

Edit `.env` if needed (defaults are configured for Docker Compose).

3. Build and start the containers:

```bash
docker-compose up -d
```

This will:

- Start a PostgreSQL database container
- Build and start the Next.js application container
- Automatically run database migrations
- Expose the application on [http://localhost:3000](http://localhost:3000)

4. View logs:

```bash
docker-compose logs -f
```

5. Stop the containers:

```bash
docker-compose down
```

6. Stop and remove all data:

```bash
docker-compose down -v
```

#### Docker Commands Reference

```bash
# Build the Docker image
docker-compose build

# Start services in detached mode
docker-compose up -d

# View running containers
docker-compose ps

# View logs for a specific service
docker-compose logs -f app
docker-compose logs -f db

# Execute commands in running container
docker-compose exec app npm run db:migrate
docker-compose exec app sh

# Restart a service
docker-compose restart app

# Rebuild and restart
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (deletes database data)
docker-compose down -v
```

#### Docker Environment Variables

The following environment variables can be configured in `.env`:

- `DATABASE_URL` - Neon PostgreSQL connection string (required)
- `APP_PORT` - Application port (default: `5055`)
- `NODE_ENV` - Environment mode (`development` or `production`)

**Note:** This project uses Neon PostgreSQL (serverless). The Docker setup does NOT include a local PostgreSQL container.

#### Production Deployment with Docker

For production deployment:

1. Update `.env` with your Neon database credentials
2. Set `NODE_ENV=production`
3. Use a reverse proxy (nginx, Traefik) for HTTPS
4. Configure proper health checks and restart policies
5. Database backups are handled by Neon

## Contributing

We welcome contributions to the AUES Dashboard! Please follow these guidelines to ensure a smooth collaboration process.

### Project Structure

```
aues-dashboard-2026/
├── app/
│   ├── db/
│   │   ├── index.ts          # Database connection setup
│   │   └── schema.ts         # Drizzle ORM schema definitions
│   ├── test-users/           # Test users page
│   ├── layout.tsx            # Root layout with navbar
│   ├── page.tsx              # Home page
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                   # shadcn/ui components
│   └── navbar.tsx            # Navigation component
├── drizzle/                  # Database migrations
├── lib/
│   └── utils.ts              # Utility functions
└── public/                   # Static assets
```

### Development Workflow

1. **Create a new branch** for your feature or bugfix:

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/bug-description
```

2. **Make your changes** following the code style guidelines below.

3. **Test your changes** locally:

```bash
npm run dev
npm run lint
npm run build
```

4. **Commit your changes** following the commit message standards (see below).

5. **Push to your branch** and create a pull request:

```bash
git push origin feature/your-feature-name
```

### Commit Message Standards

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. All commit messages must be structured as follows:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

#### Commit Types

- **feat**: A new feature

  ```bash
  git commit -m "feat: add user profile page"
  git commit -m "feat(navbar): add logout functionality"
  ```

- **fix**: A bug fix

  ```bash
  git commit -m "fix: resolve navigation menu alignment issue"
  git commit -m "fix(database): correct user query syntax"
  ```

- **docs**: Documentation only changes

  ```bash
  git commit -m "docs: update README with installation steps"
  git commit -m "docs(contributing): add commit message guidelines"
  ```

- **style**: Code style changes (formatting, missing semi-colons, etc.)

  ```bash
  git commit -m "style: format navbar component"
  git commit -m "style(global): apply prettier formatting"
  ```

- **refactor**: Code changes that neither fix bugs nor add features

  ```bash
  git commit -m "refactor: simplify database connection logic"
  git commit -m "refactor(components): extract reusable button component"
  ```

- **perf**: Performance improvements

  ```bash
  git commit -m "perf: optimize member list rendering"
  git commit -m "perf(database): add index to users table"
  ```

- **test**: Adding or updating tests

  ```bash
  git commit -m "test: add unit tests for user service"
  git commit -m "test(navbar): add component tests"
  ```

- **build**: Changes to build system or dependencies

  ```bash
  git commit -m "build: upgrade Next.js to v16"
  git commit -m "build(deps): add shadcn dropdown component"
  ```

- **ci**: CI/CD configuration changes

  ```bash
  git commit -m "ci: add GitHub Actions workflow"
  git commit -m "ci(deploy): configure Vercel deployment"
  ```

- **chore**: Other changes that don't modify src or test files
  ```bash
  git commit -m "chore: update .gitignore"
  git commit -m "chore(deps): update dependencies"
  ```

#### Breaking Changes

Use `!` after the type/scope for breaking changes, and include `BREAKING CHANGE:` in the footer:

```bash
git commit -m "feat!: redesign authentication system

BREAKING CHANGE: old auth tokens are no longer valid, users must re-authenticate"
```

#### Commit Message Examples

Good commit messages:

```bash
git commit -m "feat(members): add pagination to member list"
git commit -m "fix: prevent duplicate user entries in database"
git commit -m "docs: add database schema diagram to README"
git commit -m "refactor(navbar): simplify dropdown menu logic"
git commit -m "perf(database): add indexes for faster queries"
```

Bad commit messages:

```bash
git commit -m "fixed stuff"           # Too vague
git commit -m "WIP"                   # Work in progress should not be committed
git commit -m "Updated files"         # Not descriptive
git commit -m "asdfasdf"              # Meaningless
```

### Commit Rules

**CRITICAL: Never commit broken code.** Follow these rules strictly:

1. **Code must compile/build** - Run `npm run build` before committing
2. **No lint errors** - Run `npm run lint` and fix all errors
3. **Code must run** - Test with `npm run dev` to ensure functionality
4. **One logical change per commit** - Don't mix unrelated changes
5. **No commented-out code** - Remove it or use version control
6. **No console.logs in production code** - Remove debug statements
7. **No merge conflict markers** - Resolve all conflicts before committing
8. **No sensitive data** - Never commit API keys, passwords, or `.env` files
9. **No large files** - Don't commit build artifacts, node_modules, or large binaries
10. **Meaningful commits only** - No "WIP", "test", or "asdf" commits

#### Pre-commit Checklist

Before every commit, verify:

- [ ] Code builds successfully (`npm run build`)
- [ ] No linting errors (`npm run lint`)
- [ ] Application runs without errors (`npm run dev`)
- [ ] Changes are tested and working
- [ ] Commit message follows conventional commits format
- [ ] No sensitive information included
- [ ] No debug code or console.logs
- [ ] Changes are focused on one logical update

### Code Style Guidelines

- **TypeScript:** Use strict TypeScript types, avoid `any` when possible
- **Components:** Use functional components with TypeScript interfaces for props
- **Styling:** Use TailwindCSS utility classes, avoid inline styles
- **Imports:** Use path aliases (`@/components`, `@/lib`, etc.)
- **Naming:**
  - Components: PascalCase (e.g., `UserProfile.tsx`)
  - Files: kebab-case for utilities (e.g., `format-date.ts`)
  - Variables/functions: camelCase

### Adding shadcn/ui Components

To add new shadcn/ui components:

```bash
npx shadcn@latest add <component-name>
```

Example:

```bash
npx shadcn@latest add button
npx shadcn@latest add card
```

### Database Schema Changes

When modifying the database schema:

1. Update the schema in `app/db/schema.ts`
2. Generate migration:

```bash
npm run db:generate
```

3. Review the generated migration in `drizzle/`
4. Apply the migration:

```bash
npm run db:migrate
```

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run db:generate` - Generate Drizzle migrations from schema changes
- `npm run db:migrate` - Apply pending migrations to database

### Component Development

When creating new components:

1. Place reusable UI components in `components/ui/`
2. Place page-specific components in `components/`
3. Export components as named exports
4. Include proper TypeScript types for props
5. Use shadcn/ui components as building blocks when possible

Example component structure:

```tsx
import { cn } from "@/lib/utils";

interface YourComponentProps {
  className?: string;
  // ... other props
}

export function YourComponent({ className, ...props }: YourComponentProps) {
  return <div className={cn("base-classes", className)}>{/* component content */}</div>;
}
```

### Routes and Pages

This application uses the Next.js App Router:

- **Home** (`/`) - Dashboard landing page
- **Shirts** (`/shirts`) - Merchandise management
- **Members** (`/members`) - Member directory and management
- **Admin** (`/admin`) - Administrative controls

When adding new routes, create a folder in `app/` with a `page.tsx` file.

### Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string (Neon Serverless)

Create a `.env` file in the root directory (never commit this file).

### Pull Request Guidelines

All pull requests must meet these requirements before merging:

#### Before Creating a PR

1. **Ensure all commits follow standards** - Review commit messages
2. **Rebase on latest main** - Keep your branch up to date
   ```bash
   git checkout main
   git pull origin main
   git checkout your-branch
   git rebase main
   ```
3. **Test thoroughly** - Verify everything works
4. **Run all checks**:
   ```bash
   npm run lint    # Must pass with no errors
   npm run build   # Must complete successfully
   npm run dev     # Must run without errors
   ```

#### PR Title Format

PR titles must follow the same format as commit messages:

```
<type>[optional scope]: <description>
```

Examples:

- `feat(members): add search and filter functionality`
- `fix: resolve navbar dropdown positioning bug`
- `docs: update contributing guidelines`

#### PR Description Template

Your PR description must include:

```markdown
## Description

Brief summary of what this PR does and why.

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Code refactoring
- [ ] Performance improvement

## Related Issues

Fixes #123
Relates to #456

## Changes Made

- Detailed list of changes
- Another change
- Yet another change

## Screenshots (if applicable)

Before:
[Add screenshot]

After:
[Add screenshot]

## Testing Done

- [ ] Tested locally with `npm run dev`
- [ ] Built successfully with `npm run build`
- [ ] Linting passes with `npm run lint`
- [ ] Tested on different screen sizes (if UI change)
- [ ] Tested database migrations (if schema change)
- [ ] Manually tested all affected features

## Checklist

- [ ] My code follows the project's code style guidelines
- [ ] I have performed a self-review of my code
- [ ] I have commented my code where necessary
- [ ] I have updated the documentation accordingly
- [ ] My changes generate no new warnings or errors
- [ ] I have tested my changes thoroughly
- [ ] All commits follow the conventional commits standard
- [ ] No broken code or WIP commits included
```

#### PR Requirements

**Mandatory Requirements:**

1. **Code Quality**
   - No linting errors or warnings
   - Follows TypeScript best practices
   - Follows project coding standards
   - No commented-out code

2. **Testing**
   - Code builds successfully
   - Application runs without errors
   - All new features are tested
   - No broken functionality

3. **Documentation**
   - README updated if needed
   - Code comments where complex logic exists
   - JSDoc comments for new functions/components

4. **Commits**
   - All commits follow conventional commits format
   - No "WIP", "temp", or meaningless commit messages
   - Commits are atomic and focused
   - No merge commits (use rebase)

5. **Size and Scope**
   - PR focuses on a single feature or fix
   - Not too large (aim for <500 lines changed)
   - If large, explain why in description

6. **Breaking Changes**
   - Clearly marked with `!` in commit/PR title
   - Migration guide provided if needed
   - Breaking changes documented

**Optional but Recommended:**

- Add screenshots/GIFs for UI changes
- Reference related issues or discussions
- Add comments explaining complex decisions
- Update tests if applicable

#### Review Process

1. **Self-Review First** - Review your own PR before requesting reviews
2. **Request Reviews** - Tag appropriate reviewers
3. **Respond to Feedback** - Address all comments and questions
4. **Make Changes** - Push additional commits or amend as needed
5. **Re-request Review** - After making changes
6. **Squash if Needed** - Consider squashing fix-up commits before merge

#### PR Rejection Reasons

Your PR will be rejected if:

- ❌ Code doesn't build or has linting errors
- ❌ Contains broken functionality
- ❌ Doesn't follow commit message standards
- ❌ Includes sensitive data or credentials
- ❌ Has merge conflicts
- ❌ Missing description or context
- ❌ Too broad in scope (multiple unrelated changes)
- ❌ Doesn't follow code style guidelines
- ❌ Breaking change without proper documentation

#### After PR is Approved

1. **Ensure CI passes** (if configured)
2. **Squash and merge** or **Rebase and merge** based on project preference
3. **Delete your branch** after merging
4. **Update related issues** with the PR link

### Getting Help

If you have questions or need help:

- Open an issue for bug reports or feature requests
- Check existing issues before creating new ones
- Review the documentation for Next.js, Drizzle ORM, and shadcn/ui

---

## LLM Usage Rules

This project allows the use of Large Language Models (LLMs) like ChatGPT, Claude, or GitHub Copilot for **frontend development only**. All LLM-assisted code must follow strict guidelines.

### ✅ LLMs ARE ALLOWED FOR:

#### Frontend Development

- Creating React components with TypeScript
- Implementing UI layouts and responsive designs
- Using shadcn/ui components
- Writing TailwindCSS styles (following [STYLE_GUIDE.md](STYLE_GUIDE.md))
- Client-side form validation
- Frontend state management (useState, useReducer, custom hooks)
- Implementing user interactions and animations
- Accessibility improvements (ARIA labels, keyboard navigation)

#### Documentation

- Writing or updating README files
- Creating component documentation
- Writing code comments
- Improving user-facing documentation

### ❌ LLMs ARE STRICTLY FORBIDDEN FROM:

#### Database Operations (CRITICAL)

- **NEVER** write SQL queries
- **NEVER** modify database schema (`app/db/schema.ts`)
- **NEVER** create or modify database migrations
- **NEVER** use Drizzle ORM methods (select, insert, update, delete)
- **NEVER** touch any files in `app/db/` directory
- **NEVER** generate migration files in `drizzle/`

#### Backend Logic

- **NEVER** create API routes or endpoints
- **NEVER** write server-side data fetching logic
- **NEVER** implement authentication/authorization logic
- **NEVER** handle server actions that mutate data
- **NEVER** access or modify environment variables for database

#### Data Mutations

- **NEVER** perform INSERT, UPDATE, DELETE operations
- **NEVER** modify persistent data
- **NEVER** create database transaction logic

### Required Compliance

All LLM-generated code MUST:

1. **Follow the Style Guide** - Read and adhere to [STYLE_GUIDE.md](STYLE_GUIDE.md)
2. **Use shadcn/ui Components** - No custom implementations of standard components
3. **TypeScript Types** - Properly type all props, state, and functions
4. **Accessibility** - Include ARIA labels, semantic HTML, keyboard support
5. **Responsive Design** - Mobile-first approach with proper breakpoints
6. **Code Review** - All LLM code must be reviewed by a human before committing

### Verification Checklist

Before committing LLM-generated code, verify:

- [ ] No database operations or queries
- [ ] No modifications to `app/db/` files
- [ ] No Drizzle ORM usage
- [ ] Follows [STYLE_GUIDE.md](STYLE_GUIDE.md) completely
- [ ] Uses only shadcn/ui components
- [ ] Properly typed with TypeScript
- [ ] Includes accessibility features
- [ ] Tested on mobile and desktop
- [ ] No hardcoded colors (uses design tokens)
- [ ] No server-side logic

### Example Boundaries

```tsx
// ✅ ALLOWED - Frontend component with client-side logic
export function MemberCard({ name, email }: MemberCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader onClick={() => setIsExpanded(!isExpanded)}>
        <CardTitle>{name}</CardTitle>
        <CardDescription>{email}</CardDescription>
      </CardHeader>
      {isExpanded && <CardContent>{/* Additional details */}</CardContent>}
    </Card>
  );
}

// ❌ FORBIDDEN - Database query
export async function getMembers() {
  const members = await db.select().from(users);
  return members;
}

// ❌ FORBIDDEN - Database mutation
export async function updateMember(id: string, data: UserData) {
  await db.update(users).set(data).where(eq(users.id, id));
}

// ✅ ALLOWED - Client-side validation
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ❌ FORBIDDEN - Server action with database
("use server");
export async function createMember(formData: FormData) {
  await db.insert(users).values({ name: formData.get("name") });
}
```

### Consequences of Violations

Pull requests containing LLM-generated code that violates these rules will be:

- ❌ **Immediately rejected**
- ❌ **Required to rewrite from scratch**
- ❌ **Flagged for review of contributor's understanding**

### When in Doubt

If you're using an LLM and encounter any of these scenarios:

1. **LLM suggests database code** → ⚠️ STOP and flag for human review
2. **Task requires data persistence** → ⚠️ Do NOT use LLM
3. **Unsure if it's frontend-only** → ⚠️ Ask a maintainer first
4. **LLM modifies schema files** → ⚠️ Revert immediately

### Recommended LLM Workflow

1. **Read [STYLE_GUIDE.md](STYLE_GUIDE.md)** before starting
2. **Provide style guide to LLM** in your prompts
3. **Review all generated code** line by line
4. **Test thoroughly** before committing
5. **Run linting and type checks**
6. **Verify no database operations**
7. **Human review required** before PR submission

### Reporting Violations

If you see LLM-generated code that violates these rules:

1. Comment on the PR with specific violations
2. Reference this section of the README
3. Request immediate revision
4. Do not merge until fixed

---

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
