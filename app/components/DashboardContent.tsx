"use client";

import { useEffect, useMemo, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Users,
  TrendingUp,
  UserCheck,
  Activity,
  ArrowRight,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { useUserStore } from "@/app/store/userStore";
import { useMembersStore } from "@/app/store/membersStore";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { MemberChart } from "./MemberChart";
import { RecentActivity } from "./RecentActivity";
import { parseDate } from "@/app/utils/dateFormatter";

interface DashboardContentProps {
  accountSetupComplete: boolean;
}

export function DashboardContent({ accountSetupComplete }: DashboardContentProps) {
  const currentUser = useUserStore((state) => state.currentUser);
  const currentUserLoading = useUserStore((state) => state.currentUserLoading);
  const fetchCurrentUser = useUserStore((state) => state.fetchCurrentUser);

  const members = useMembersStore((state) => state.members);
  const membersLoading = useMembersStore((state) => state.membersLoading);
  const fetchMembers = useMembersStore((state) => state.fetchMembers);
  const growthRate = useMembersStore((state) => state.growthRate);

  const hasFetchedUser = useRef(false);
  const hasFetchedMembers = useRef(false);

  useEffect(() => {
    if (!hasFetchedUser.current && !currentUser && !currentUserLoading) {
      hasFetchedUser.current = true;
      fetchCurrentUser();
    }
    if (!hasFetchedMembers.current && members.length === 0 && !membersLoading) {
      hasFetchedMembers.current = true;
      fetchMembers();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";

  const monthlyMembers = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return members.filter((m) => {
      const createdAt = parseDate(m.createdAt);
      if (!createdAt) return false;
      return createdAt >= startOfMonth;
    }).length;
  }, [members]);

  if (currentUserLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="flex items-center gap-4 mb-8">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="container mx-auto p-4 md:p-6 max-w-7xl">
        {!accountSetupComplete && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Alert
              variant="destructive"
              className="mb-6 border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20 shadow-sm"
            >
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500" />
              <AlertTitle className="text-red-900 dark:text-red-100 font-semibold">
                Account Setup Incomplete
              </AlertTitle>
              <AlertDescription className="text-red-800 dark:text-red-200">
                Please complete your account setup in your profile to access all dashboard features.
                <Link
                  href="/profile"
                  className="inline-flex items-center gap-1 ml-1 font-medium underline underline-offset-2 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
                >
                  Go to Profile
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
        {/* Header with User Info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 md:h-32 md:w-32 border-4 border-white dark:border-slate-800 shadow-lg">
              <AvatarImage
                src={currentUser?.image ?? undefined}
                alt={currentUser?.name ?? "User"}
                className="object-cover"
              />
              <AvatarFallback className="text-2xl font-semibold bg-primary/10 text-primary">
                {currentUser?.name?.charAt(0).toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold tracking-tight">
                {greeting}, {currentUser?.name ?? "User"}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-muted-foreground">Welcome to your dashboard</p>
                {currentUser?.role && (
                  <Badge variant={currentUser.role === "Admin" ? "default" : "secondary"}>
                    {currentUser.role}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            {new Date().toLocaleDateString("en-AU", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membersLoading ? <Skeleton className="h-8 w-12" /> : members.length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Charts coming soon</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                New This Month
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membersLoading ? <Skeleton className="h-8 w-12" /> : monthlyMembers}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Members joined this month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Growth Rate
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div
                className={`text-2xl font-bold ${growthRate() >= 0 ? "text-green-600" : "text-red-600"}`}
              >
                {membersLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  `${growthRate() >= 0 ? "+" : ""}${growthRate()}%`
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">vs last month</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Members
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {membersLoading ? (
                  <Skeleton className="h-8 w-12" />
                ) : (
                  members.filter((m) => m.isValid).length
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {!membersLoading && members.length > 0
                  ? `${Math.round((members.filter((m) => m.isValid).length / members.length) * 100)}% of total`
                  : "Valid memberships"}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart Placeholder */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Member Analytics</CardTitle>
                  <CardDescription>New members over the last 6 months</CardDescription>
                </div>
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent>
              <MemberChart />
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and navigation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 flex flex-col">
              <Link href="/members">
                <Button variant="outline" className="w-full justify-between">
                  View Members
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="outline" className="w-full justify-between">
                  Edit Profile
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {currentUser?.role === "Admin" && (
                <Link href="/admin">
                  <Button variant="outline" className="w-full justify-between">
                    Admin Panel
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <RecentActivity />
      </div>
    </div>
  );
}
