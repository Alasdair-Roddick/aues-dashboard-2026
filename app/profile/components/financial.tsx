"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import { getCurrentUser, updateCurrentUser, type CurrentUser } from "@/lib/getUser";
import { toast } from "sonner";
import { Pencil, X, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FinancialSection() {
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [bankName, setBankName] = useState("");
  const [bsb, setBsb] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUser(data);
      setBankName(data?.bankName ?? "");
      setBsb(data?.BSB ?? "");
      setAccountNumber(data?.accountNumber ?? "");
      setAccountName(data?.accountName ?? "");
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const result = await updateCurrentUser({
      bankName,
      BSB: bsb,
      accountNumber,
      accountName,
    });

    if (result.success) {
      setUser((prev) =>
        prev ? { ...prev, bankName, BSB: bsb, accountNumber, accountName } : null,
      );
      setEditing(false);
      toast.success("Financial details updated successfully");
    } else {
      toast.error("Failed to update financial details", { description: result.error });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setBankName(user?.bankName ?? "");
    setBsb(user?.BSB ?? "");
    setAccountNumber(user?.accountNumber ?? "");
    setAccountName(user?.accountName ?? "");
    setEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Manage your bank details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Financial Information</CardTitle>
          <CardDescription>Manage your bank details</CardDescription>
        </div>
        {!editing ? (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              <Check className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        {!editing ? (
          <div className="space-y-3">
            <div>
              <Label className="text-muted-foreground">Bank Name</Label>
              <p className="text-sm font-medium mt-1">{user?.bankName || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">BSB</Label>
              <p className="text-sm font-medium mt-1">{user?.BSB || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Number</Label>
              <p className="text-sm font-medium mt-1">{user?.accountNumber || "—"}</p>
            </div>
            <div>
              <Label className="text-muted-foreground">Account Name</Label>
              <p className="text-sm font-medium mt-1">{user?.accountName || "—"}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Enter your bank name"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bsb">BSB</Label>
              <Input
                id="bsb"
                value={bsb}
                onChange={(e) => setBsb(e.target.value)}
                placeholder="Enter your BSB"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Enter your account number"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="accountName">Account Name</Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Enter your account name"
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
