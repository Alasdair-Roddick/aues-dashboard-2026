import { colord, extend } from "colord";
import a11yPlugin from "colord/plugins/a11y";

extend([a11yPlugin]);

/**
 * Generate a complete color palette from a single hex color
 * Returns shades suitable for a design system (50-950 scale)
 */
export function generateColorPalette(hex: string) {
  const base = colord(hex);

  return {
    50: base.lighten(0.4).desaturate(0.1).toHex(),
    100: base.lighten(0.35).desaturate(0.05).toHex(),
    200: base.lighten(0.25).toHex(),
    300: base.lighten(0.15).toHex(),
    400: base.lighten(0.08).toHex(),
    500: base.toHex(), // Base color
    600: base.darken(0.08).toHex(),
    700: base.darken(0.15).toHex(),
    800: base.darken(0.25).toHex(),
    900: base.darken(0.35).toHex(),
    950: base.darken(0.45).saturate(0.1).toHex(),
  };
}

/**
 * Convert hex to HSL string for CSS
 */
export function hexToHsl(hex: string): string {
  const { h, s, l } = colord(hex).toHsl();
  return `${h.toFixed(1)} ${s.toFixed(1)}% ${l.toFixed(1)}%`;
}

/**
 * Get a color that has good contrast with the input color
 * Returns either white or black
 */
export function getContrastColor(hex: string): string {
  return colord(hex).isLight() ? "#000000" : "#ffffff";
}

/**
 * Generate a complete theme from a primary color
 * This creates all necessary CSS variables for shadcn/ui
 */
export function generateThemeFromColor(primaryHex: string, secondaryHex: string, isDark = false) {
  const primary = colord(primaryHex);
  const secondary = colord(secondaryHex);

  if (isDark) {
    // Dark mode theme
    return {
      background: "240 10% 3.9%",
      foreground: "0 0% 98%",
      card: "240 10% 3.9%",
      "card-foreground": "0 0% 98%",
      popover: "240 10% 3.9%",
      "popover-foreground": "0 0% 98%",
      primary: hexToHsl(primaryHex),
      "primary-foreground": hexToHsl(getContrastColor(primaryHex)),
      secondary: hexToHsl(secondaryHex),
      "secondary-foreground": hexToHsl(getContrastColor(secondaryHex)),
      muted: "240 3.7% 15.9%",
      "muted-foreground": "240 5% 64.9%",
      accent: hexToHsl(secondary.darken(0.1).toHex()),
      "accent-foreground": hexToHsl(getContrastColor(secondaryHex)),
      destructive: "0 62.8% 30.6%",
      "destructive-foreground": "0 0% 98%",
      border: "240 3.7% 15.9%",
      input: "240 3.7% 15.9%",
      ring: hexToHsl(primary.lighten(0.1).toHex()),
      "chart-1": hexToHsl(primary.toHex()),
      "chart-2": hexToHsl(secondary.toHex()),
      "chart-3": hexToHsl(primary.rotate(120).toHex()),
      "chart-4": hexToHsl(secondary.rotate(120).toHex()),
      "chart-5": hexToHsl(primary.rotate(240).toHex()),
    };
  } else {
    // Light mode theme
    return {
      background: "0 0% 100%",
      foreground: "240 10% 3.9%",
      card: "0 0% 100%",
      "card-foreground": "240 10% 3.9%",
      popover: "0 0% 100%",
      "popover-foreground": "240 10% 3.9%",
      primary: hexToHsl(primaryHex),
      "primary-foreground": hexToHsl(getContrastColor(primaryHex)),
      secondary: hexToHsl(secondaryHex),
      "secondary-foreground": hexToHsl(getContrastColor(secondaryHex)),
      muted: "240 4.8% 95.9%",
      "muted-foreground": "240 3.8% 46.1%",
      accent: hexToHsl(secondary.lighten(0.3).toHex()),
      "accent-foreground": hexToHsl(getContrastColor(secondaryHex)),
      destructive: "0 84.2% 60.2%",
      "destructive-foreground": "0 0% 98%",
      border: "240 5.9% 90%",
      input: "240 5.9% 90%",
      ring: hexToHsl(primary.darken(0.1).toHex()),
      "chart-1": hexToHsl(primary.toHex()),
      "chart-2": hexToHsl(secondary.toHex()),
      "chart-3": hexToHsl(primary.rotate(120).toHex()),
      "chart-4": hexToHsl(secondary.rotate(120).toHex()),
      "chart-5": hexToHsl(primary.rotate(240).toHex()),
    };
  }
}

/**
 * Apply theme variables to the document root
 */
export function applyThemeVariables(variables: Record<string, string>) {
  const root = document.documentElement;

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(`--${key}`, value);
  });
}
