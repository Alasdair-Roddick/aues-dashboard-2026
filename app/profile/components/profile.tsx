"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState, useRef } from "react";
import { getCurrentUser, updateCurrentUser, type CurrentUser } from "@/lib/getUser";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pencil, X, Check, Camera } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/app/context/UserContext";

export function ProfileSection() {
  const { refreshUser } = useUser();
  const [user, setUser] = useState<CurrentUser>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  useEffect(() => {
    getCurrentUser().then((data) => {
      setUser(data);
      setLastName(data?.lastName ?? "");
      setEmail(data?.email ?? "");
      setPhoneNumber(data?.phoneNumber ?? "");
      setLoading(false);
    });
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUser((prev) => (prev ? { ...prev, image: result.url } : null));
        await refreshUser();
        toast.success("Profile picture updated");
      } else {
        toast.error("Upload failed", { description: result.error });
      }
    } catch (error) {
      toast.error("Upload failed", { description: "An error occurred" });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateCurrentUser({
      lastName,
      email,
      phoneNumber,
    });

    if (result.success) {
      setUser((prev) => (prev ? { ...prev, lastName, email, phoneNumber } : null));
      setEditing(false);
      toast.success("Profile updated successfully");
    } else {
      toast.error("Failed to update profile", { description: result.error });
    }
    setSaving(false);
  };

  const handleCancel = () => {
    setLastName(user?.lastName ?? "");
    setEmail(user?.email ?? "");
    setPhoneNumber(user?.phoneNumber ?? "");
    setEditing(false);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Profile</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Skeleton className="w-32 h-32 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Profile</CardTitle>
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
        <div className="flex items-start gap-6">
          <div className="relative group">
            <Avatar className="w-32 h-32 border-4 border-muted">
              <AvatarImage
                src={user?.image ?? undefined}
                alt={user?.name ?? "User Avatar"}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-medium bg-primary/10 text-primary">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </AvatarFallback>
            </Avatar>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer disabled:cursor-wait"
            >
              <Camera className="h-8 w-8 text-white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleImageUpload}
              className="hidden"
            />
            {uploadingImage && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {!editing ? (
            <div className="space-y-2">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight">
                  {user?.name ?? "User"} {user?.lastName ?? ""}
                </h2>
                {user?.role && (
                  <Badge variant={user.role === "Admin" ? "default" : "secondary"} className="mt-1">
                    {user.role}
                  </Badge>
                )}
              </div>
              <div className="space-y-1 pt-1">
                <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{user?.phoneNumber ?? "—"}</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 space-y-4">
              <div className="grid gap-1.5">
                <Label className="text-muted-foreground">Username</Label>
                <p className="text-sm font-medium">{user?.name}</p>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
