import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ShirtsContent } from "./components/ShirtsContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Shirt Orders - AUES Dashboard",
};

export default async function ShirtsPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role;

  // Only Admin or Treasurer can access
  if (!session?.user || (userRole !== "Admin" && userRole !== "Treasurer")) {
    redirect("/");
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] overflow-y-auto bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 md:h-[calc(100dvh-4rem)] md:overflow-hidden">
      <div className="container mx-auto min-h-[calc(100dvh-4rem)] max-w-7xl p-4 md:h-full md:p-6 flex flex-col">

        <div className="flex-1 md:min-h-0">
          <ShirtsContent />
        </div>
      </div>
    </div>
  );
}
