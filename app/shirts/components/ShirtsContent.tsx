"use client";

import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useShirtOrderStore } from "@/app/store/shirtOrderStore";
import { ShirtOrderCard } from "./ShirtOrderCard";
import { toast } from "sonner";
import type { OrderStatus } from "@/app/actions/squarespace";
import { useShallow } from "zustand/react/shallow";
import { Box, CheckCircle2, Clock3, Search, RefreshCw } from "lucide-react";

type SectionKey = "PENDING" | "PACKED" | "FULFILLED";

export function ShirtsContent() {
  const {
    orders,
    loading,
    loadingMore,
    hasMore,
    totalForActive,
    statusCounts,
    activeStatus,
    syncing,
    searchQuery,
    setSearchQuery,
    fetchOrders,
    loadMore,
    setActiveStatus,
    syncOrders,
    startPolling,
    stopPolling,
  } = useShirtOrderStore(
    useShallow((state) => ({
      orders: state.orders,
      loading: state.loading,
      loadingMore: state.loadingMore,
      hasMore: state.hasMore,
      totalForActive: state.totalForActive,
      statusCounts: state.statusCounts,
      activeStatus: state.activeStatus,
      syncing: state.syncing,
      searchQuery: state.searchQuery,
      setSearchQuery: state.setSearchQuery,
      fetchOrders: state.fetchOrders,
      loadMore: state.loadMore,
      setActiveStatus: state.setActiveStatus,
      syncOrders: state.syncOrders,
      startPolling: state.startPolling,
      stopPolling: state.stopPolling,
    })),
  );
  const initialSearchHandled = useRef(false);
  const scrollAreaRef = useRef<HTMLDivElement | null>(null);
  const loadTriggerRef = useRef<HTMLDivElement | null>(null);
  const autoLoadInFlightRef = useRef(false);

  useEffect(() => {
    startPolling(5000);

    return () => {
      stopPolling();
    };
  }, [startPolling, stopPolling]);

  useEffect(() => {
    if (!initialSearchHandled.current) {
      initialSearchHandled.current = true;
      return;
    }

    const timeout = setTimeout(() => {
      fetchOrders({ reset: true });
    }, 250);

    return () => clearTimeout(timeout);
  }, [searchQuery, fetchOrders]);

  useEffect(() => {
    fetchOrders({ reset: true });
  }, [activeStatus, fetchOrders]);

  useEffect(() => {
    const target = loadTriggerRef.current;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const root = isMobile ? null : scrollAreaRef.current;

    if (!target || !hasMore || loading || loadingMore) {
      return;
    }

    const observer = new IntersectionObserver(
      async ([entry]) => {
        if (!entry?.isIntersecting || autoLoadInFlightRef.current) {
          return;
        }

        autoLoadInFlightRef.current = true;
        try {
          await loadMore();
        } finally {
          autoLoadInFlightRef.current = false;
        }
      },
      {
        root,
        rootMargin: "0px 0px 320px 0px",
        threshold: 0.01,
      },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadMore, activeStatus]);

  const handleSync = async () => {
    const result = await syncOrders();
    if (result.success) {
      toast.success(`Synced! Added: ${result.added}, Updated: ${result.updated}`);
    } else {
      toast.error(result.error || "Failed to sync orders");
    }
  };

  const pendingOrders = statusCounts.PENDING;
  const packedOrders = statusCounts.PACKED;
  const fulfilledOrders = statusCounts.FULFILLED;

  const sections: { key: SectionKey; label: string; count: number; color: string }[] = [
    { key: "PENDING", label: "Pending", count: pendingOrders, color: "amber" },
    { key: "PACKED", label: "Packed", count: packedOrders, color: "blue" },
    { key: "FULFILLED", label: "Fulfilled", count: fulfilledOrders, color: "green" },
  ];

  const activeSection = activeStatus as SectionKey;
  const activeOrders = orders;

  return (
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="border-slate-200/70 bg-white/85 py-0 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/60">
        <CardContent className="space-y-4 px-4 py-4 md:px-6">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name, email, Squarespace #, product, size..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-10 rounded-lg pl-9"
              />
            </div>
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              className="h-10 shrink-0 rounded-lg px-4"
            >
              {syncing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync Squarespace
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3">
            <div className="rounded-lg border border-amber-200/60 bg-amber-50/80 p-3 dark:border-amber-900/40 dark:bg-amber-950/20">
              <p className="text-[11px] font-medium uppercase tracking-wide text-amber-700 dark:text-amber-300">
                Pending
              </p>
              <p className="mt-1 text-lg font-bold text-amber-800 dark:text-amber-200">
                {pendingOrders}
              </p>
            </div>
            <div className="rounded-lg border border-blue-200/60 bg-blue-50/80 p-3 dark:border-blue-900/40 dark:bg-blue-950/20">
              <p className="text-[11px] font-medium uppercase tracking-wide text-blue-700 dark:text-blue-300">
                Packed
              </p>
              <p className="mt-1 text-lg font-bold text-blue-800 dark:text-blue-200">
                {packedOrders}
              </p>
            </div>
            <div className="rounded-lg border border-emerald-200/60 bg-emerald-50/80 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <p className="text-[11px] font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                Fulfilled
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-800 dark:text-emerald-200">
                {fulfilledOrders}
              </p>
            </div>
          </div>

          <div className="sm:hidden">
            <Select
              value={activeStatus}
              onValueChange={(value) => setActiveStatus(value as OrderStatus)}
            >
              <SelectTrigger className="h-10 w-full rounded-lg">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDING">Pending ({pendingOrders})</SelectItem>
                <SelectItem value="PACKED">Packed ({packedOrders})</SelectItem>
                <SelectItem value="FULFILLED">Fulfilled ({fulfilledOrders})</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="hidden gap-2 sm:flex">
            {sections.map((section) => {
              const isActive = activeSection === section.key;
              const icon =
                section.key === "PENDING" ? Clock3 : section.key === "PACKED" ? Box : CheckCircle2;
              const Icon = icon;

              return (
                <Button
                  key={section.key}
                  type="button"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setActiveStatus(section.key as OrderStatus)}
                  className="h-10 rounded-lg px-4"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {section.label}
                  <Badge
                    variant={isActive ? "secondary" : "outline"}
                    className="ml-2 border-0 bg-black/10 text-[10px] font-semibold text-current dark:bg-white/15"
                  >
                    {section.count}
                  </Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Active Section - scrollable for large datasets */}
      <Card className="flex flex-col overflow-hidden border-slate-200/70 bg-white/85 py-0 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-950/60 md:min-h-0 md:flex-1">
        <CardHeader className="space-y-2 border-b px-4 py-3 md:px-6">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              {activeSection}
            </CardTitle>
            <Badge variant="outline" className="font-mono text-[11px]">
              {activeOrders.length}/{totalForActive}
            </Badge>
          </div>
        </CardHeader>

        <CardContent
          ref={scrollAreaRef}
          className="overflow-visible px-4 py-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:px-6"
        >
          {loading ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-72 w-full rounded-xl" />
              ))}
            </div>
          ) : activeOrders.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <svg
                className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <p className="text-lg font-medium">No {activeSection.toLowerCase()} orders</p>
              <p className="text-sm mt-1">
                {searchQuery
                  ? "Try a different search term"
                  : "Orders will appear here when available"}
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {activeOrders.map((order) => (
                  <ShirtOrderCard key={order.id} order={order} />
                ))}
              </div>

              <div ref={loadTriggerRef} className="h-6 w-full" />

              {hasMore && (
                <div className="mt-2 flex justify-center text-xs text-muted-foreground">
                  {loadingMore ? "Loading more..." : "Scroll to load more"}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
