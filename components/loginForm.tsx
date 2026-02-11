"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useUserStore } from "@/app/store/userStore";
import { User, Lock, LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [focused, setFocused] = useState<string | null>(null);
  const router = useRouter();
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    startTransition(async () => {
      try {
        const result = await signIn("credentials", {
          username,
          password,
          redirect: false,
        });

        if (result?.error) {
          setError("Invalid username or password");
        } else if (result?.ok) {
          await fetchCurrentUser();
          router.refresh();
          router.push("/");
        }
      } catch {
        setError("An unexpected error occurred");
      }
    });
  }

  return (
    <div className="rounded-2xl border border-border/60 bg-card/95 p-6 text-card-foreground shadow-xl shadow-primary/10 ring-1 ring-primary/10 backdrop-blur-xl dark:border-border/50 dark:bg-card/85 dark:shadow-black/40 dark:ring-border/40">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Welcome back</h2>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to access the dashboard.
          </p>
        </div>

        {/* Username */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs text-muted-foreground">
            Username
          </Label>
          <div className="relative">
            <User
              size={15}
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                focused === "username" ? "text-primary" : "text-muted-foreground/70"
              }`}
            />
            <Input
              id="username"
              name="username"
              type="text"
              required
              disabled={isPending}
              autoComplete="username"
              onFocus={() => setFocused("username")}
              onBlur={() => setFocused(null)}
              className="h-10 rounded-lg border-border/70 bg-background/90 pl-9 pr-3 dark:bg-background/70"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-xs text-muted-foreground">
            Password
          </Label>
          <div className="relative">
            <Lock
              size={15}
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                focused === "password" ? "text-primary" : "text-muted-foreground/70"
              }`}
            />
            <Input
              id="password"
              name="password"
              type="password"
              required
              disabled={isPending}
              autoComplete="current-password"
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              className="h-10 rounded-lg border-border/70 bg-background/90 pl-9 pr-3 dark:bg-background/70"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          disabled={isPending}
          className="h-10 w-full rounded-lg shadow-sm shadow-primary/30"
        >
          {isPending ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
          {isPending ? "Signing in..." : "Sign in"}
        </Button>
      </form>
    </div>
  );
}
