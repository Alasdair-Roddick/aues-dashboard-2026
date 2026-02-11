"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getUserReceipts } from "@/app/actions/receipts";
import { CheckCircle, Clock, XCircle, Receipt, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface ReceiptData {
  id: string;
  amount: string;
  description: string | null;
  receiptImageUrl: string;
  requiresPriorApproval: boolean;
  approvedByUserId: string | null;
  status: "Pending" | "Fulfilled" | "Rejected";
  treasurerNotes: string | null;
  processedAt: Date | null;
  createdAt: Date;
  approvedByName: string | null;
}

export function ReceiptsSection() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isActive = true;

    getUserReceipts().then((result) => {
      if (!isActive) return;
      if (result.success && result.data) {
        setReceipts(result.data as ReceiptData[]);
      }
      setIsLoading(false);
    });

    return () => {
      isActive = false;
    };
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case "Fulfilled":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Fulfilled
          </Badge>
        );
      case "Rejected":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const stats = {
    total: receipts.length,
    pending: receipts.filter((r) => r.status === "Pending").length,
    fulfilled: receipts.filter((r) => r.status === "Fulfilled").length,
    rejected: receipts.filter((r) => r.status === "Rejected").length,
    totalAmount: receipts.reduce((sum, r) => sum + parseFloat(r.amount), 0),
    fulfilledAmount: receipts
      .filter((r) => r.status === "Fulfilled")
      .reduce((sum, r) => sum + parseFloat(r.amount), 0),
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Receipt Reimbursements
          </CardTitle>
          <CardDescription>View and manage your reimbursement requests</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Requests</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">Pending</p>
              <p className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
                {stats.pending}
              </p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-300">Fulfilled</p>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                {stats.fulfilled}
              </p>
            </div>
            <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
              <p className="text-sm text-red-700 dark:text-red-300">Rejected</p>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300">{stats.rejected}</p>
            </div>
          </div>

          {/* Amount Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 border rounded-lg">
              <p className="text-sm text-muted-foreground">Total Requested</p>
              <p className="text-xl font-bold">${stats.totalAmount.toFixed(2)}</p>
            </div>
            <div className="p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <p className="text-sm text-green-700 dark:text-green-300">Total Fulfilled</p>
              <p className="text-xl font-bold text-green-700 dark:text-green-300">
                ${stats.fulfilledAmount.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Recent Requests */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Recent Requests</h3>
              <Button variant="outline" size="sm" onClick={() => router.push("/receipts")}>
                <ExternalLink className="h-4 w-4 mr-1" />
                View All
              </Button>
            </div>

            {isLoading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : receipts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No reimbursement requests yet</p>
                <Button onClick={() => router.push("/receipts")}>Submit Your First Request</Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.slice(0, 5).map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="text-sm">
                        {new Date(receipt.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-medium">
                        ${parseFloat(receipt.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-sm">
                        {receipt.description || "-"}
                      </TableCell>
                      <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {receipts.length > 5 && (
              <p className="text-sm text-muted-foreground text-center mt-4">
                Showing 5 of {receipts.length} requests.{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto"
                  onClick={() => router.push("/receipts")}
                >
                  View all
                </Button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
