import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminContent } from "./components/AdminContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - AUES Dashboard",
};

export default async function AdminPage() {
  const session = await auth();
  const userRole = (session?.user as { role?: string } | undefined)?.role ?? null;

  // Only Admin can access user management
  if (!session?.user || userRole !== "Admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Manage users and their access to the dashboard
          </p>
        </div>

        <AdminContent userRole={userRole} />
      </div>
    </div>
  );
}
