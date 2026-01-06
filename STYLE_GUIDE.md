# AUES Dashboard - Frontend Style Guide

This style guide outlines the design standards and patterns for the AUES Dashboard frontend. **LLMs are permitted to assist with frontend design but must strictly adhere to these guidelines.**

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Patterns](#component-patterns)
6. [Interactions & States](#interactions--states)
7. [Responsive Design](#responsive-design)
8. [Accessibility](#accessibility)
9. [LLM Usage Rules](#llm-usage-rules)

---

## Design Principles

### 1. Consistency
- Use shadcn/ui components as the foundation
- Maintain consistent patterns across all pages
- Reuse existing components before creating new ones

### 2. Simplicity
- Clean, minimal interfaces
- Avoid unnecessary decorations or animations
- Focus on functionality over aesthetics

### 3. Clarity
- Clear visual hierarchy
- Obvious interaction points
- Descriptive labels and error messages

### 4. Performance
- Optimize images and assets
- Minimize JavaScript bundle size
- Use Next.js Image component for all images

---

## Color Palette

### Base Colors (CSS Variables)

We use TailwindCSS with CSS variables from shadcn/ui:

```css
--background: neutral-50
--foreground: neutral-950
--card: neutral-0
--card-foreground: neutral-950
--popover: neutral-0
--popover-foreground: neutral-950
--primary: neutral-900
--primary-foreground: neutral-50
--secondary: neutral-100
--secondary-foreground: neutral-900
--muted: neutral-100
--muted-foreground: neutral-500
--accent: neutral-100
--accent-foreground: neutral-900
--destructive: red-500
--destructive-foreground: neutral-50
--border: neutral-200
--input: neutral-200
--ring: neutral-950
```

### Usage Guidelines

- **Primary Actions**: Use `bg-primary` for main CTAs
- **Secondary Actions**: Use `bg-secondary` or `border` variants
- **Destructive Actions**: Use `bg-destructive` for delete/remove actions
- **Text**:
  - Primary text: `text-foreground`
  - Secondary text: `text-muted-foreground`
  - Disabled text: `text-muted-foreground opacity-50`

### Colors to NEVER Use

❌ Do NOT use arbitrary color values:
- `bg-[#hexcode]`
- `text-blue-500` (unless part of design system)
- Custom RGB values
- Inline style colors

✅ Always use design tokens:
- `bg-primary`, `bg-secondary`, `bg-accent`
- `text-foreground`, `text-muted-foreground`

---

## Typography

### Font Family

- **Primary Font**: System font stack (Next.js default)
- **Monospace**: For code snippets only

### Font Sizes

Use TailwindCSS typography scale:

```
text-xs    (12px) - Captions, metadata
text-sm    (14px) - Secondary text, labels
text-base  (16px) - Body text (default)
text-lg    (18px) - Emphasized text
text-xl    (20px) - Subheadings
text-2xl   (24px) - Section headings
text-3xl   (30px) - Page headings
text-4xl   (36px) - Hero text (rare)
```

### Font Weights

```
font-normal    (400) - Body text
font-medium    (500) - Emphasized text, labels
font-semibold  (600) - Subheadings
font-bold      (700) - Headings
```

### Typography Rules

- **Headings**: Use semantic HTML (`h1`, `h2`, `h3`)
- **Line Height**: Use default Tailwind values (`leading-normal`, `leading-tight`)
- **Letter Spacing**: Avoid custom tracking unless absolutely necessary
- **Text Alignment**: Left-align by default, center only for special cases

---

## Spacing & Layout

### Spacing Scale

Use TailwindCSS spacing scale (4px base unit):

```
0   (0px)
1   (4px)
2   (8px)
3   (12px)
4   (16px)
6   (24px)
8   (32px)
12  (48px)
16  (64px)
20  (80px)
24  (96px)
```

### Layout Patterns

#### Container Width
```tsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>
```

#### Card Layout
```tsx
<div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
  {/* Card content */}
</div>
```

#### Grid System
```tsx
// 2-column grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {/* Items */}
</div>

// 3-column grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Items */}
</div>
```

### Spacing Rules

- **Consistent Padding**: Use `p-4` or `p-6` for card/container padding
- **Consistent Gaps**: Use `gap-4` or `gap-6` for grid/flex gaps
- **Section Spacing**: Use `space-y-6` or `space-y-8` between sections
- **Component Spacing**: Use `mb-4` or `mb-6` for vertical rhythm

---

## Component Patterns

### Buttons

Always use shadcn/ui Button component:

```tsx
import { Button } from "@/components/ui/button"

// Primary action
<Button>Submit</Button>

// Secondary action
<Button variant="secondary">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Outline
<Button variant="outline">View Details</Button>

// Ghost (minimal)
<Button variant="ghost">Close</Button>

// With icon
<Button>
  <Icon className="mr-2 h-4 w-4" />
  Action
</Button>
```

### Forms

Use shadcn/ui form components:

```tsx
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input
    id="email"
    type="email"
    placeholder="you@example.com"
  />
</div>
```

### Cards

```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Optional description</CardDescription>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    {/* Footer actions */}
  </CardFooter>
</Card>
```

### Navigation

Follow the existing navbar pattern:

```tsx
// Use NavigationMenu from shadcn/ui
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink } from "@/components/ui/navigation-menu"

// Consistent height: h-16
// Centered content with container
// Border at bottom: border-b
```

### Tables

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table"

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Email</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>John Doe</TableCell>
      <TableCell>john@example.com</TableCell>
    </TableRow>
  </TableBody>
</Table>
```

---

## Interactions & States

### Hover States

Always include hover states for interactive elements:

```tsx
// Buttons - handled by shadcn/ui
<Button>Hover Me</Button>

// Links
<a href="#" className="hover:underline">Link</a>

// Cards
<div className="transition-colors hover:bg-accent">Card</div>
```

### Focus States

Ensure keyboard navigation support:

```tsx
// Handled by shadcn/ui components
<Button>Accessible Button</Button>

// Custom elements
<div className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
  Custom focusable
</div>
```

### Loading States

```tsx
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

<Button disabled>
  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
  Loading...
</Button>
```

### Disabled States

```tsx
<Button disabled>Disabled</Button>
<Input disabled placeholder="Disabled input" />
```

### Error States

```tsx
import { Input } from "@/components/ui/input"

<div className="space-y-2">
  <Input
    className="border-destructive"
    placeholder="Invalid email"
  />
  <p className="text-sm text-destructive">
    Please enter a valid email address
  </p>
</div>
```

---

## Responsive Design

### Breakpoints

TailwindCSS breakpoints (mobile-first):

```
sm:  640px  (Small tablets)
md:  768px  (Tablets)
lg:  1024px (Laptops)
xl:  1280px (Desktops)
2xl: 1536px (Large desktops)
```

### Responsive Patterns

#### Responsive Grid
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Items */}
</div>
```

#### Responsive Padding
```tsx
<div className="px-4 md:px-6 lg:px-8">
  {/* Content */}
</div>
```

#### Responsive Text
```tsx
<h1 className="text-2xl md:text-3xl lg:text-4xl">
  Responsive Heading
</h1>
```

#### Hide/Show Elements
```tsx
// Hide on mobile, show on desktop
<div className="hidden md:block">Desktop only</div>

// Show on mobile, hide on desktop
<div className="block md:hidden">Mobile only</div>
```

### Mobile-First Rules

- Design for mobile first, enhance for larger screens
- Test on mobile viewport (375px width minimum)
- Ensure touch targets are at least 44x44px
- Avoid horizontal scrolling
- Use responsive navigation patterns

---

## Accessibility

### ARIA Labels

```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

### Semantic HTML

```tsx
// ✅ Good
<nav>
  <ul>
    <li><a href="/">Home</a></li>
  </ul>
</nav>

// ❌ Bad
<div className="nav">
  <div className="nav-item">Home</div>
</div>
```

### Keyboard Navigation

- All interactive elements must be keyboard accessible
- Use proper focus indicators
- Support Tab, Enter, Space, Escape keys
- Use shadcn/ui components (they handle this)

### Color Contrast

- Minimum contrast ratio: 4.5:1 for normal text
- Minimum contrast ratio: 3:1 for large text
- Use shadcn/ui color tokens (automatically compliant)

### Screen Readers

```tsx
// Hide decorative elements
<div aria-hidden="true">★★★★★</div>

// Provide alternative text
<img src="chart.png" alt="Sales trend showing 20% increase" />

// Use sr-only for screen reader only text
<span className="sr-only">Loading...</span>
```

---

## LLM Usage Rules

### ✅ LLMs ARE ALLOWED TO:

1. **Create Frontend Components**
   - Design and build UI components using shadcn/ui
   - Create page layouts and responsive designs
   - Write JSX/TSX for React components

2. **Style Components**
   - Apply TailwindCSS classes according to this style guide
   - Create responsive layouts using breakpoints
   - Implement hover, focus, and active states

3. **Handle Frontend Logic**
   - Implement form validation (client-side)
   - Manage component state with useState/useReducer
   - Handle user interactions and events
   - Create custom hooks for UI logic

4. **Work with Design Tokens**
   - Use CSS variables and design tokens
   - Apply consistent spacing and typography
   - Follow color palette guidelines

5. **Accessibility Improvements**
   - Add ARIA labels
   - Implement keyboard navigation
   - Ensure semantic HTML

### ❌ LLMs ARE STRICTLY FORBIDDEN TO:

1. **Database Operations**
   - ❌ NEVER write SQL queries
   - ❌ NEVER modify database schema
   - ❌ NEVER create database migrations
   - ❌ NEVER touch files in `app/db/`
   - ❌ NEVER use Drizzle ORM methods
   - ❌ NEVER create or modify `schema.ts`

2. **Backend Logic**
   - ❌ NEVER create API routes
   - ❌ NEVER write server-side data fetching
   - ❌ NEVER handle authentication logic
   - ❌ NEVER access environment variables for DB

3. **Data Mutations**
   - ❌ NEVER perform INSERT, UPDATE, DELETE operations
   - ❌ NEVER call database-related functions
   - ❌ NEVER modify data persistence layer

### Required Patterns

When LLMs work on frontend code, they MUST:

1. **Use shadcn/ui components** - Never create custom button, input, or form components from scratch
2. **Follow this style guide** - All styling must match documented patterns
3. **Use TypeScript** - Properly type all props and state
4. **Include accessibility** - ARIA labels, semantic HTML, keyboard support
5. **Test responsiveness** - Ensure mobile-first design
6. **Ask for clarification** - If database interaction is needed, flag it for human review

### Example Boundaries

```tsx
// ✅ ALLOWED - Frontend component with state
export function UserProfileCard({ userId }: { userId: string }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent>
        {/* UI logic only */}
      </CardContent>
    </Card>
  )
}

// ❌ FORBIDDEN - Database query
export async function getUserData(userId: string) {
  const user = await db.select().from(users).where(eq(users.id, userId))
  return user
}

// ✅ ALLOWED - Form validation (client-side)
function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// ❌ FORBIDDEN - Server action with DB mutation
async function updateUser(formData: FormData) {
  const email = formData.get('email')
  await db.update(users).set({ email }).where(eq(users.id, userId))
}
```

### When in Doubt

If you're unsure whether an LLM should handle a task:

1. **Does it involve the database?** → ❌ NO LLM
2. **Does it modify persistent data?** → ❌ NO LLM
3. **Is it purely visual/interactive?** → ✅ LLM OK
4. **Is it a shadcn/ui component?** → ✅ LLM OK

---

## Component Checklist

Before submitting frontend code, verify:

- [ ] Uses shadcn/ui components where applicable
- [ ] Follows color palette (no arbitrary colors)
- [ ] Uses correct spacing scale
- [ ] Implements hover/focus states
- [ ] Is responsive (mobile-first)
- [ ] Has proper TypeScript types
- [ ] Includes accessibility features
- [ ] Matches existing design patterns
- [ ] Has NO database operations
- [ ] Has NO backend logic

---

## Resources

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Documentation](https://www.radix-ui.com/primitives)
- [Lucide Icons](https://lucide.dev)
- [Next.js Documentation](https://nextjs.org/docs)

---

**Last Updated**: 2026-01-06
**Version**: 1.0.0
