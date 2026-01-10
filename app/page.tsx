import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "./components/DashboardContent";
import { isAccountSetupComplete } from "./lib/accountSetup";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"


export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const accountSetupComplete = await isAccountSetupComplete(session.user.id || "");

  return <DashboardContent accountSetupComplete={accountSetupComplete} />;
}
