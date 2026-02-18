"use client";

import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  UserPlus,
  UserCog,
  UserX,
  Shield,
  Settings,
  Package,
  PackageCheck,
  Receipt,
  LogIn,
  LogOut,
  Users,
  RefreshCw,
  Shirt,
} from "lucide-react";
import { useActivityStore } from "@/app/store/activityStore";

const ICON_MAP: Record<string, { icon: typeof Activity; color: string }> = {
  USER_CREATED: { icon: UserPlus, color: "text-green-600" },
  USER_UPDATED: { icon: UserCog, color: "text-blue-600" },
  USER_DELETED: { icon: UserX, color: "text-red-600" },
  USER_ROLE_CHANGED: { icon: Shield, color: "text-purple-600" },
  SETTINGS_UPDATED: { icon: Settings, color: "text-gray-600" },
  ORDER_SYNCED: { icon: Shirt, color: "text-blue-600" },
  ORDER_STATUS_UPDATED: { icon: Package, color: "text-orange-600" },
  ORDER_PACKED: { icon: Package, color: "text-yellow-600" },
  ORDER_FULFILLED: { icon: PackageCheck, color: "text-green-600" },
  RECEIPT_SUBMITTED: { icon: Receipt, color: "text-blue-600" },
  RECEIPT_APPROVED: { icon: Receipt, color: "text-green-600" },
  RECEIPT_REJECTED: { icon: Receipt, color: "text-red-600" },
  RECEIPT_FULFILLED: { icon: Receipt, color: "text-green-600" },
  MEMBER_SYNCED: { icon: UserPlus, color: "text-green-600" },
  LOGIN: { icon: LogIn, color: "text-gray-600" },
  LOGOUT: { icon: LogOut, color: "text-gray-600" },
};

function getRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - new Date(date).getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;

  return new Date(date).toLocaleDateString("en-AU", { day: "numeric", month: "short" });
}

export function RecentActivity() {
  const activities = useActivityStore((s) => s.activities);
  const loading = useActivityStore((s) => s.loading);
  const fetchActivity = useActivityStore((s) => s.fetchActivity);
  const startPolling = useActivityStore((s) => s.startPolling);
  const stopPolling = useActivityStore((s) => s.stopPolling);

  useEffect(() => {
    fetchActivity();
    startPolling(10000);
    return () => stopPolling();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest updates and changes</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="h-32 flex items-center justify-center border-2 border-dashed rounded-lg bg-muted/30">
            <div className="text-center text-muted-foreground">
              <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activity</p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {activities.map((item) => {
              const config = ICON_MAP[item.icon] ?? { icon: Activity, color: "text-gray-600" };
              const Icon = config.icon;

              return (
                <div
                  key={item.id}
                  className="flex items-center gap-3 py-2 px-2 rounded-md hover:bg-muted/50 transition-colors"
                >
                  <div className={`shrink-0 ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                    {getRelativeTime(item.createdAt)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
