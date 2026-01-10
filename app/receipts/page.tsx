import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { ReceiptContent } from "./components/ReceiptContent";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Receipts - AUES Dashboard"
}

export default async function ReceiptsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-4xl font-bold tracking-tight bg-linear-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Receipt Reimbursements
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-2">
            Submit and track your reimbursement requests
          </p>
        </div>

        <ReceiptContent />
      </div>
    </div>
  );
}
