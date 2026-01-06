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
npm install
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
npm run db:generate
npm run db:migrate
```

5. Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

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
```

2. **Make your changes** following the code style guidelines below.

3. **Test your changes** locally:
```bash
npm run dev
npm run lint
npm run build
```

4. **Commit your changes** with clear, descriptive messages:
```bash
git commit -m "Add: feature description"
```

5. **Push to your branch** and create a pull request:
```bash
git push origin feature/your-feature-name
```

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
import { cn } from "@/lib/utils"

interface YourComponentProps {
  className?: string
  // ... other props
}

export function YourComponent({ className, ...props }: YourComponentProps) {
  return (
    <div className={cn("base-classes", className)}>
      {/* component content */}
    </div>
  )
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

- Provide a clear description of the changes
- Reference any related issues
- Include screenshots for UI changes
- Ensure all tests pass and code is linted
- Keep PRs focused on a single feature or fix
- Update documentation if needed

### Getting Help

If you have questions or need help:
- Open an issue for bug reports or feature requests
- Check existing issues before creating new ones
- Review the documentation for Next.js, Drizzle ORM, and shadcn/ui

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Drizzle ORM Documentation](https://orm.drizzle.team/docs/overview)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)

