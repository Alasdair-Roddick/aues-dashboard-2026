"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"

import { addUserAction } from "../actions"
import { useState, useRef } from "react"
import { toast } from "sonner"
import { UserPlus, User, Shield, Key } from "lucide-react"
import { useUserStore } from "@/app/store/userStore"

export function AddUserForm() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedRole, setSelectedRole] = useState("General");
    const formRef = useRef<HTMLFormElement>(null);
    const addUser = useUserStore((state) => state.addUser);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsSubmitting(true);

        const formData = new FormData(e.currentTarget);
        const username = formData.get("username") as string;

        try {
            const result = await addUserAction(formData);

            if (result.success) {
                toast.success("User added successfully", {
                    description: `${username} has been added with default password: ${username}2026`
                });

                // Add user to Zustand store immediately
                addUser({
                    id: crypto.randomUUID(), // Temporary ID, will be updated on next fetch
                    name: username,
                    image: null,
                    role: formData.get("role") as "Admin" | "General" | "Temporary",
                    isActive: true,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                });

                // Reset form using ref
                formRef.current?.reset();
                setSelectedRole("General");
            } else {
                toast.error("Failed to add user", {
                    description: result.error
                });
            }
        } catch (error) {
            toast.error("Failed to add user", {
                description: error instanceof Error ? error.message : "Unknown error occurred"
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <UserPlus className="h-6 w-6" />
              Add New User
            </CardTitle>
            <CardDescription>
              Create a new user account for the dashboard
            </CardDescription>
          </CardHeader>
          <Separator />
          <form ref={formRef} onSubmit={handleSubmit}>
            <CardContent className="pt-6 space-y-6">
              <Field>
                <FieldLabel htmlFor="username" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  Name
                </FieldLabel>
                <FieldContent>
                  <Input
                    id="username"
                    name="username"
                    placeholder="e.g. Alasdair"
                    required
                    className="mt-1.5"
                  />
                </FieldContent>
              </Field>

              <Field className="w-full">
                <FieldLabel htmlFor="role" className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  Role
                </FieldLabel>
                <FieldContent>
                  <Select name="role" value={selectedRole} onValueChange={setSelectedRole} required>
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">
                        <span className="flex items-center gap-2">
                          General
                          <span className="text-xs text-muted-foreground">— Standard access</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="Admin">
                        <span className="flex items-center gap-2">
                          Admin
                          <span className="text-xs text-muted-foreground">— Full access</span>
                        </span>
                      </SelectItem>
                      <SelectItem value="Temporary">
                        <span className="flex items-center gap-2">
                          Temporary
                          <span className="text-xs text-muted-foreground">— Limited time</span>
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>

              <div className="rounded-lg bg-muted/50 p-4 border border-dashed">
                <div className="flex items-start gap-3">
                  <Key className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Default Password</p>
                    <p className="text-xs text-muted-foreground">
                      The password will be set to <code className="bg-muted px-1.5 py-0.5 rounded text-foreground font-mono">username2026</code>
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <span className="animate-pulse">Adding user...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add User
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      );

}