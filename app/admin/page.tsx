import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { AdminContent } from "./components/AdminContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - AUES Dashboard"
}

export default async function AdminPage() {
  const session = await auth();

  // Check if user is authenticated and has Admin role
  if (!session?.user || (session.user as any).role !== "Admin") {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Admin Panel
          </h1>
          <p className="text-muted-foreground mt-2">
            Manage users and their access to the dashboard
          </p>
        </div>

        <AdminContent />
      </div>
    </div>
  );
}
