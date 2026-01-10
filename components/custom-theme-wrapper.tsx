import { getUserCustomizations } from "@/app/actions/customizations";
import { ThemeProvider } from "./theme-provider";
import { auth } from "@/auth";

/**
 * Server component that fetches user customizations and passes them to ThemeProvider
 */
export async function CustomThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let customizations = null;
  if (session?.user?.id) {
    customizations = await getUserCustomizations(session.user.id);
  }

  return (
    <ThemeProvider
      lightPrimaryColor={customizations?.lightPrimaryColor}
      lightSecondaryColor={customizations?.lightSecondaryColor}
      darkPrimaryColor={customizations?.darkPrimaryColor}
      darkSecondaryColor={customizations?.darkSecondaryColor}
    >
      {children}
    </ThemeProvider>
  );
}
