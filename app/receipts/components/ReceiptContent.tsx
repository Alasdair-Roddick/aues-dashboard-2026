"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";
import { createReceiptReimbursement, getUserReceipts, getAdminUsers } from "@/app/actions/receipts";
import { getCurrentUser, type CurrentUser } from "@/lib/getUser";
import { Upload, Receipt, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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

interface Admin {
  id: string;
  name: string;
}

export function ReceiptContent() {
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [receipts, setReceipts] = useState<ReceiptData[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser>(null);

  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    receiptImageUrl: "",
    requiresPriorApproval: false,
    approvedByUserId: "",
  });

  const userBankDetails = {
    bankName: currentUser?.bankName || "",
    BSB: currentUser?.BSB || "",
    accountNumber: currentUser?.accountNumber || "",
    accountName: currentUser?.accountName || "",
  };

  const hasBankDetails = userBankDetails.bankName && userBankDetails.BSB && userBankDetails.accountNumber && userBankDetails.accountName;

  useEffect(() => {
    loadReceipts();
    loadAdmins();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const userData = await getCurrentUser();
    setCurrentUser(userData);
  };

  const loadReceipts = async () => {
    const result = await getUserReceipts();
    if (result.success && result.data) {
      setReceipts(result.data as ReceiptData[]);
    }
  };

  const loadAdmins = async () => {
    const result = await getAdminUsers();
    if (result.success && result.data) {
      setAdmins(result.data as Admin[]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadFile = async () => {
    if (!selectedFile) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch("/api/upload/receipt", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({ ...prev, receiptImageUrl: result.url }));
        toast.success("Receipt uploaded successfully!");
      } else {
        toast.error(result.error || "Upload failed");
      }
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setUploadingFile(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.receiptImageUrl) {
      toast.error("Please upload a receipt image first");
      return;
    }

    if (!hasBankDetails) {
      toast.error("Please complete your bank details in your profile before submitting a reimbursement request");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createReceiptReimbursement(formData);

      if (result.success) {
        toast.success("Reimbursement request submitted successfully!");
        setFormData({
          amount: "",
          description: "",
          receiptImageUrl: "",
          requiresPriorApproval: false,
          approvedByUserId: "",
        });
        setSelectedFile(null);
        setPreviewUrl(null);
        loadReceipts();
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    } catch (error) {
      toast.error("Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
      case "Fulfilled":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle className="h-3 w-3 mr-1" />Fulfilled</Badge>;
      case "Rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Bank Details Warning */}
      {!hasBankDetails && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800">
          <CardContent className="pt-6">
            <p className="text-yellow-800 dark:text-yellow-200">
              Please complete your bank details in your profile before submitting reimbursement requests.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Submit New Reimbursement Request */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Submit New Reimbursement Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-9"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What was this purchase for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Receipt Upload */}
            <div className="space-y-2">
              <Label htmlFor="receipt">Receipt Image</Label>
              <div className="space-y-3">
                <Input
                  id="receipt"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                />
                {previewUrl && selectedFile?.type.startsWith("image/") && (
                  <div className="relative w-full h-48 rounded-md overflow-hidden border">
                    <img src={previewUrl} alt="Receipt preview" className="w-full h-full object-contain" />
                  </div>
                )}
                {selectedFile && !formData.receiptImageUrl && (
                  <Button
                    type="button"
                    onClick={handleUploadFile}
                    disabled={uploadingFile}
                    variant="outline"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingFile ? "Uploading..." : "Upload Receipt"}
                  </Button>
                )}
                {formData.receiptImageUrl && (
                  <p className="text-sm text-green-600 dark:text-green-400">Receipt uploaded successfully!</p>
                )}
              </div>
            </div>

            {/* Prior Approval */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="priorApproval"
                  checked={formData.requiresPriorApproval}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiresPriorApproval: checked as boolean })
                  }
                />
                <Label htmlFor="priorApproval" className="cursor-pointer">
                  This purchase required prior approval
                </Label>
              </div>

              {formData.requiresPriorApproval && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="approver">Who approved this purchase?</Label>
                  <select
                    id="approver"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    value={formData.approvedByUserId}
                    onChange={(e) => setFormData({ ...formData, approvedByUserId: e.target.value })}
                    required={formData.requiresPriorApproval}
                  >
                    <option value="">Select an Executive Team member</option>
                    {admins.map((admin) => (
                      <option key={admin.id} value={admin.id}>
                        {admin.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Bank Details Display */}
            {hasBankDetails && (
              <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium">Payment will be sent to:</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Bank:</span> {userBankDetails.bankName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Name:</span> {userBankDetails.accountName}
                  </div>
                  <div>
                    <span className="text-muted-foreground">BSB:</span> {userBankDetails.BSB}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Account Number:</span> {userBankDetails.accountNumber}
                  </div>
                </div>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting || !hasBankDetails} className="w-full">
              {isSubmitting ? "Submitting..." : "Submit Reimbursement Request"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* My Requests */}
      <Card>
        <CardHeader>
          <CardTitle>My Requests</CardTitle>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No reimbursement requests yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {receipts.map((receipt) => (
                  <TableRow key={receipt.id}>
                    <TableCell>{new Date(receipt.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>${parseFloat(receipt.amount).toFixed(2)}</TableCell>
                    <TableCell>{receipt.description || "-"}</TableCell>
                    <TableCell>{getStatusBadge(receipt.status)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {receipt.treasurerNotes || "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
