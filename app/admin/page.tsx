import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();

  // Check if user is authenticated and has Admin role
  if (!session?.user || (session.user as any).role !== "Admin") {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid gap-4">
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Welcome, Administrator</h2>
          <p className="text-muted-foreground">
            This page is only accessible to users with the Admin role.
          </p>
        </div>
        <div className="border rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Admin Tools</h2>
          <p className="text-muted-foreground">
            Admin functionality will be added here.
          </p>
        </div>
      </div>
    </div>
  );
}
