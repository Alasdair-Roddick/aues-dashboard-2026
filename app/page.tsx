import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardContent } from "./components/DashboardContent";

export default async function Home() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return <DashboardContent />;
}
