# Theme Customization Guide

This application includes a custom color system that works seamlessly with shadcn/ui components and supports both light and dark modes using next-themes.

## How It Works

The custom theme system dynamically applies user-selected colors to CSS variables that shadcn/ui uses internally. Colors are:
- Stored in the database per user (`userCustomisations` table)
- Converted from hex to OKLCH format (matching shadcn's color system)
- Applied at runtime using CSS custom properties
- Different colors for light mode and dark mode
- Theme preference (light/dark/system) saved per user

## Files Overview

### Core Files
- **`lib/color-utils.ts`** - Color conversion utilities (hex to OKLCH)
- **`components/theme-provider.tsx`** - Client component that applies custom colors based on theme
- **`components/custom-theme-wrapper.tsx`** - Server component that fetches user colors
- **`app/actions/customizations.ts`** - Server actions for reading/writing color preferences
- **`app/profile/components/appearance.tsx`** - UI component for theme and color customization
- **`app/layout.tsx`** - Root layout with next-themes integration

### Database Schema
```typescript
// app/db/schema.ts
export const userCustomisations = pgTable("user_customizations", {
  userId: uuid("userId").notNull().references(() => users.id),
  // Light mode colors
  lightPrimaryColor: text("lightPrimaryColor").notNull().default("#2563eb"),
  lightSecondaryColor: text("lightSecondaryColor").notNull().default("#10b981"),
  // Dark mode colors
  darkPrimaryColor: text("darkPrimaryColor").notNull().default("#3b82f6"),
  darkSecondaryColor: text("darkSecondaryColor").notNull().default("#22c55e"),
  // Theme preference
  theme: text("theme").$type<"light" | "dark" | "system">().notNull().default("system"),
});
```

## Usage

### For Users
1. Navigate to your Profile page
2. Click on the "Appearance" tab
3. Select your theme mode (Light, Dark, or System)
4. Customize colors for both light and dark modes using the color pickers
5. Click "Save Changes"
6. The page will automatically refresh to apply your changes

### For Developers

#### Using Custom Colors in Components
All shadcn/ui components automatically use the custom colors:

```tsx
import { Button } from "@/components/ui/button";

// This button will use the user's custom primary color
<Button>Click Me</Button>

// This button will use the user's custom secondary color
<Button variant="secondary">Secondary Action</Button>
```

#### Accessing Colors in Custom Components
```tsx
// Use Tailwind classes - they automatically reference the CSS variables
<div className="bg-primary text-primary-foreground">
  Primary colored div
</div>

<div className="bg-secondary text-secondary-foreground">
  Secondary colored div
</div>
```

#### Programmatically Updating Colors
```typescript
import { updateUserCustomizations } from "@/app/actions/customizations";

await updateUserCustomizations(
  userId,
  "#2563eb", // light primary
  "#10b981", // light secondary
  "#3b82f6", // dark primary
  "#22c55e", // dark secondary
  "system"   // theme preference
);
```

#### Fetching User Colors
```typescript
import { getUserCustomizations } from "@/app/actions/customizations";

const colors = await getUserCustomizations(userId);
console.log(colors?.lightPrimaryColor); // e.g., "#2563eb"
console.log(colors?.darkPrimaryColor); // e.g., "#3b82f6"
console.log(colors?.theme); // e.g., "system"
```

#### Using the Theme
```tsx
"use client";
import { useTheme } from "next-themes";

function MyComponent() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  // theme: user's preference ("light" | "dark" | "system")
  // resolvedTheme: actual theme being used ("light" | "dark")

  return (
    <button onClick={() => setTheme("dark")}>
      Switch to Dark Mode
    </button>
  );
}
```

## Supported CSS Variables

The theme system updates these CSS variables based on the current theme:
- `--primary` - Primary brand color
- `--primary-foreground` - Text color on primary backgrounds
- `--secondary` - Secondary accent color
- `--secondary-foreground` - Text color on secondary backgrounds
- `--accent` - Accent color (mapped to secondary)
- `--accent-foreground` - Text color on accent backgrounds

## Database Migration

After updating the schema, run:

```bash
npm run db:generate
npm run db:push
```

If you need to migrate existing users to have default colors:

```sql
INSERT INTO user_customizations (
  userId,
  lightPrimaryColor,
  lightSecondaryColor,
  darkPrimaryColor,
  darkSecondaryColor,
  theme
)
SELECT
  id,
  '#2563eb',
  '#10b981',
  '#3b82f6',
  '#22c55e',
  'system'
FROM users
ON CONFLICT (userId) DO NOTHING;
```

## Dark Mode Support

The system automatically switches colors based on the active theme:
- **Light mode**: Uses `lightPrimaryColor` and `lightSecondaryColor`
- **Dark mode**: Uses `darkPrimaryColor` and `darkSecondaryColor`
- **System**: Follows the user's OS preference

The theme switcher in the Appearance section allows users to:
- Force light mode
- Force dark mode
- Follow system preference (default)

## Extending the System

### Adding More Color Variables
1. Add new fields to the database schema:
```typescript
lightAccentColor: text("lightAccentColor").notNull().default("#f59e0b"),
darkAccentColor: text("darkAccentColor").notNull().default("#fbbf24"),
```

2. Update the `theme-provider.tsx` to handle the new colors
3. Update server actions to include the new fields
4. Add color pickers in the appearance component

### Customizing Color Conversion
Edit `lib/color-utils.ts` to adjust the hex to OKLCH conversion algorithm if certain colors don't look right.

## Troubleshooting

**Colors not applying?**
- Ensure you clicked "Save Changes" in the Appearance section
- The page should automatically refresh after saving
- Check browser console for errors
- Verify the database has the customization record

**Theme not switching?**
- Clear browser cache and cookies
- Check that next-themes is properly installed
- Verify `suppressHydrationWarning` is on the `<html>` tag

**Colors look wrong?**
- The hex to OKLCH conversion is approximate
- Try slightly different hex values for better results
- Ensure sufficient contrast for accessibility

**Dark mode colors not working?**
- Check that you've set colors for both light AND dark modes
- Verify the theme is actually switching (check DevTools)
- Ensure `resolvedTheme` from useTheme() is correct

## Architecture Notes

- **Server Component**: `CustomThemeWrapper` fetches colors on the server
- **Client Component**: `ThemeProvider` applies colors and listens to theme changes
- **next-themes**: Handles theme switching and persistence
- **shadcn/ui**: All components respect CSS custom properties
- **Color Persistence**: Stored in PostgreSQL via Drizzle ORM
