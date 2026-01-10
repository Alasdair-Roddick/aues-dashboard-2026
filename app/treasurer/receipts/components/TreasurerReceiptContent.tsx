"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getAllReceipts, updateReceiptStatus } from "@/app/actions/receipts";
import { CheckCircle, Clock, XCircle, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

interface ReceiptData {
  id: string;
  userId: string;
  userName: string;
  userBankName: string | null;
  userBSB: string | null;
  userAccountNumber: string | null;
  userAccountName: string | null;
  amount: string;
  description: string | null;
  receiptImageUrl: string;
  requiresPriorApproval: boolean;
  approvedByUserId: string | null;
  status: "Pending" | "Fulfilled" | "Rejected";
  treasurerNotes: string | null;
  processedByUserId: string | null;
  processedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export function TreasurerReceiptContent() {
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptData | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [treasurerNotes, setTreasurerNotes] = useState("");
  const [filter, setFilter] = useState<"All" | "Pending" | "Fulfilled" | "Rejected">("All");

  useEffect(() => {
    loadReceipts();
  }, []);

  const loadReceipts = async () => {
    const result = await getAllReceipts();
    if (result.success && result.data) {
      setReceipts(result.data as ReceiptData[]);
    }
  };

  const handleViewReceipt = (receipt: ReceiptData) => {
    setSelectedReceipt(receipt);
    setTreasurerNotes(receipt.treasurerNotes || "");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (status: "Pending" | "Fulfilled" | "Rejected") => {
    if (!selectedReceipt) return;

    setIsProcessing(true);
    try {
      const result = await updateReceiptStatus(selectedReceipt.id, status, treasurerNotes);

      if (result.success) {
        toast.success(`Receipt ${status.toLowerCase()} successfully!`);
        setIsModalOpen(false);
        setSelectedReceipt(null);
        setTreasurerNotes("");
        loadReceipts();
      } else {
        toast.error(result.error || "Failed to update receipt status");
      }
    } catch (error) {
      toast.error("Failed to update receipt status");
    } finally {
      setIsProcessing(false);
    }
  };

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

  const filteredReceipts = filter === "All"
    ? receipts
    : receipts.filter(r => r.status === filter);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "All" ? "default" : "outline"}
          onClick={() => setFilter("All")}
        >
          All ({receipts.length})
        </Button>
        <Button
          variant={filter === "Pending" ? "default" : "outline"}
          onClick={() => setFilter("Pending")}
        >
          Pending ({receipts.filter(r => r.status === "Pending").length})
        </Button>
        <Button
          variant={filter === "Fulfilled" ? "default" : "outline"}
          onClick={() => setFilter("Fulfilled")}
        >
          Fulfilled ({receipts.filter(r => r.status === "Fulfilled").length})
        </Button>
        <Button
          variant={filter === "Rejected" ? "default" : "outline"}
          onClick={() => setFilter("Rejected")}
        >
          Rejected ({receipts.filter(r => r.status === "Rejected").length})
        </Button>
      </div>

      {/* Receipts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Reimbursement Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredReceipts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reimbursement requests</p>
          ) : (
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{receipt.userName}</TableCell>
                    <TableCell className="font-medium">${parseFloat(receipt.amount).toFixed(2)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {receipt.description || "-"}
                    </TableCell>
                    <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewReceipt(receipt)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Receipt Detail Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Reimbursement Request Details</DialogTitle>
            <DialogDescription>
              Review the request and update its status
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4 md:space-y-6">
              {/* User Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 p-3 md:p-4 bg-muted/50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Submitted by</p>
                  <p className="text-base font-medium">{selectedReceipt.userName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p className="text-base">{new Date(selectedReceipt.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Amount</p>
                  <p className="text-2xl font-bold">${parseFloat(selectedReceipt.amount).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <div className="mt-1">{getStatusBadge(selectedReceipt.status)}</div>
                </div>
              </div>

              {/* Description */}
              {selectedReceipt.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="mt-1 text-sm text-muted-foreground">{selectedReceipt.description}</p>
                </div>
              )}

              {/* Bank Details */}
              <div className="p-3 md:p-4 border rounded-lg">
                <p className="text-sm font-medium mb-2">Bank Details</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bank:</span>{" "}
                    {selectedReceipt.userBankName || "Not provided"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Name:</span>{" "}
                    {selectedReceipt.userAccountName || "Not provided"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">BSB:</span>{" "}
                    {selectedReceipt.userBSB || "Not provided"}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Number:</span>{" "}
                    {selectedReceipt.userAccountNumber || "Not provided"}
                  </div>
                </div>
              </div>

              {/* Prior Approval */}
              {selectedReceipt.requiresPriorApproval && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    This purchase required prior approval
                  </p>
                </div>
              )}

              {/* Receipt Image */}
              <div>
                <Label className="text-sm font-medium mb-2 block">Receipt Image</Label>
                <div className="border rounded-lg overflow-hidden">
                  {selectedReceipt.receiptImageUrl.endsWith('.pdf') ? (
                    <div className="p-8 text-center bg-muted/50">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground mb-4">PDF Receipt</p>
                      <Button
                        variant="outline"
                        onClick={() => window.open(selectedReceipt.receiptImageUrl, '_blank')}
                      >
                        Open PDF
                      </Button>
                    </div>
                  ) : (
                    <img
                      src={selectedReceipt.receiptImageUrl}
                      alt="Receipt"
                      className="w-full h-auto"
                    />
                  )}
                </div>
              </div>

              {/* Treasurer Notes */}
              <div>
                <Label htmlFor="notes" className="text-sm font-medium">
                  Treasurer Notes
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Add notes about this reimbursement..."
                  value={treasurerNotes}
                  onChange={(e) => setTreasurerNotes(e.target.value)}
                  className="mt-1"
                  rows={4}
                />
              </div>

              {/* Action Buttons */}
              <DialogFooter>
                <div className="flex flex-col sm:flex-row gap-2 w-full justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isProcessing}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:bg-red-50 border-red-200"
                    onClick={() => handleUpdateStatus("Rejected")}
                    disabled={isProcessing}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    variant="outline"
                    className="text-yellow-600 hover:bg-yellow-50 border-yellow-200"
                    onClick={() => handleUpdateStatus("Pending")}
                    disabled={isProcessing}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Mark as Pending
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus("Fulfilled")}
                    disabled={isProcessing}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    {isProcessing ? "Processing..." : "Mark as Fulfilled"}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
