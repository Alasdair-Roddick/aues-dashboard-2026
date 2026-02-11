"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { changePassword } from "@/lib/getUser";
import { toast } from "sonner";
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

export function SecuritySection() {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setSaving(true);
    const result = await changePassword({
      currentPassword,
      newPassword,
    });

    if (result.success) {
      toast.success("Password changed successfully");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error("Failed to change password", { description: result.error });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setIsChangingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          <div>
            <CardTitle>Security</CardTitle>
            <CardDescription>Manage your account security settings</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isChangingPassword ? (
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Lock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
            </div>
            <Button variant="outline" onClick={() => setIsChangingPassword(true)}>
              Change Password
            </Button>
          </div>
        ) : (
          <div className="space-y-4 p-4 rounded-lg border">
            <div className="grid gap-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">Must be at least 8 characters</p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={saving}>
                {saving ? "Saving..." : "Update Password"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
