"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { generateThemeFromColor, applyThemeVariables } from "@/lib/color-utils";

interface ThemeProviderProps {
  lightPrimaryColor?: string;
  lightSecondaryColor?: string;
  darkPrimaryColor?: string;
  darkSecondaryColor?: string;
  children?: React.ReactNode;
}

/**
 * ThemeProvider component that dynamically applies custom colors to CSS variables
 * Works with shadcn/ui's color system and next-themes for dark mode support
 * Generates a complete theme palette from primary and secondary colors
 */
export function ThemeProvider({
  lightPrimaryColor,
  lightSecondaryColor,
  darkPrimaryColor,
  darkSecondaryColor,
  children,
}: ThemeProviderProps) {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (!lightPrimaryColor || !lightSecondaryColor || !darkPrimaryColor || !darkSecondaryColor) {
      return;
    }

    const isDark = resolvedTheme === "dark";

    // Generate complete theme based on current mode
    const theme = generateThemeFromColor(
      isDark ? darkPrimaryColor : lightPrimaryColor,
      isDark ? darkSecondaryColor : lightSecondaryColor,
      isDark
    );

    // Apply all theme variables
    applyThemeVariables(theme);
  }, [lightPrimaryColor, lightSecondaryColor, darkPrimaryColor, darkSecondaryColor, resolvedTheme]);

  return <>{children}</>;
}
