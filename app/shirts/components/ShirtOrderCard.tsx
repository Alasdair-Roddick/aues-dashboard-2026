"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useShirtOrderStore } from "@/app/store/shirtOrderStore";
import { type ShirtOrder, type OrderStatus } from "@/app/actions/squarespace";
import { ShippingModal } from "./ShippingModal";
import { toast } from "sonner";
import {
  CalendarDays,
  Hash,
  Mail,
  MoreHorizontal,
  Package2,
  PackageCheck,
  PackageX,
  Ruler,
  Truck,
  Trash2,
} from "lucide-react";

interface ShirtOrderCardProps {
  order: ShirtOrder;
}

function formatAction(action: string): string {
  switch (action) {
    case "ORDER_SYNCED":
      return "Added";
    case "ORDER_STATUS_UPDATED":
      return "Updated";
    case "ORDER_PACKED":
      return "Packed";
    case "ORDER_FULFILLED":
      return "Fulfilled";
    default:
      return "Updated";
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
}

function getFulfillmentBadgeClasses(status: string): string {
  switch (status) {
    case "PACKED":
      return "border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300";
    case "FULFILLED":
      return "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300";
    default:
      return "border-amber-300 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300";
  }
}

export function ShirtOrderCard({ order }: ShirtOrderCardProps) {
  const updateStatus = useShirtOrderStore((state) => state.updateStatus);
  const removeOrder = useShirtOrderStore((state) => state.removeOrder);
  const setShipping = useShirtOrderStore((state) => state.setShipping);

  const [shippingModalOpen, setShippingModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [savingShipping, setSavingShipping] = useState(false);

  const customerOrderCode = order.orderNumber ? order.orderNumber.slice(-4).toUpperCase() : "----";
  const lastActivity = order.activity?.[0];
  const totalQuantity = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const sizeBreakdown = order.items.reduce(
    (acc, item) => {
      const sizeKey = item.size?.trim() || "No size";
      acc[sizeKey] = (acc[sizeKey] || 0) + item.quantity;
      return acc;
    },
    {} as Record<string, number>,
  );
  const sortedSizeBreakdown = Object.entries(sizeBreakdown).sort(([a], [b]) => a.localeCompare(b));

  const handleStatusChange = async (newStatus: OrderStatus) => {
    const result = await updateStatus(order.id, newStatus);
    if (result.success) {
      const statusMessages: Record<OrderStatus, string> = {
        PENDING: "Moved back to pending",
        PACKED: "Marked as packed",
        FULFILLED: "Marked as fulfilled",
      };
      toast.success(statusMessages[newStatus]);
    } else {
      toast.error(result.error || "Failed to update status");
    }
  };

  const handleDelete = async () => {
    if (deleting) return;
    setDeleting(true);
    const result = await removeOrder(order.id);
    if (result.success) {
      toast.success(`Deleted order ${order.orderNumber ?? "unknown"}`);
      setDeleteDialogOpen(false);
    } else {
      toast.error(result.error || "Failed to delete order");
    }
    setDeleting(false);
  };

  const handleShippingSubmit = async (trackingNumber: string, carrier = "auspost") => {
    setSavingShipping(true);
    const result = await setShipping(order.id, trackingNumber, carrier);
    if (result.success) {
      toast.success("Shipping saved");
      setShippingModalOpen(false);
    } else {
      toast.error(result.error || "Failed to save shipping");
    }
    setSavingShipping(false);
  };

  const renderActions = () => {
    switch (order.fulfillmentStatus) {
      case "PENDING":
        return (
          <Button
            size="sm"
            onClick={() => handleStatusChange("PACKED")}
            className="w-full rounded-lg"
          >
            <PackageCheck className="mr-2 h-4 w-4" />
            Mark as Packed
          </Button>
        );
      case "PACKED":
        return (
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("PENDING")}
              className="flex-1 rounded-lg"
            >
              Pending
            </Button>
            <Button
              size="sm"
              onClick={() => handleStatusChange("FULFILLED")}
              className="flex-1 rounded-lg"
            >
              Fulfill
            </Button>
          </div>
        );
      case "FULFILLED":
        return (
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("PENDING")}
              className="flex-1 rounded-lg"
            >
              Pending
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleStatusChange("PACKED")}
              className="flex-1 rounded-lg"
            >
              Packed
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <Card className="overflow-hidden border-slate-200/80 bg-gradient-to-b from-white to-slate-50/70 py-0 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-950/70">
        <CardHeader className="space-y-3 border-b px-4 py-4 md:px-5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <CardTitle className="truncate text-base">{order.customerName}</CardTitle>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mail className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{order.customerEmail}</span>
              </p>
            </div>

            <div className="flex items-center gap-1">
              <Badge variant="outline" className="h-8 rounded-md px-2 font-mono text-xs">
                #{customerOrderCode}
              </Badge>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="rounded-md">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">Order actions</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleStatusChange("PENDING")}
                    disabled={order.fulfillmentStatus === "PENDING"}
                  >
                    <PackageX className="mr-2 h-4 w-4" />
                    Force set pending
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShippingModalOpen(true)}>
                    <Truck className="mr-2 h-4 w-4" />
                    {order.shippingStatus === "SHIPPED" ? "Edit shipping" : "Add shipping"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setDeleteDialogOpen(true)} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className={getFulfillmentBadgeClasses(order.fulfillmentStatus)}
            >
              {order.fulfillmentStatus}
            </Badge>
            <Badge variant={order.shippingStatus === "SHIPPED" ? "default" : "secondary"}>
              {order.shippingStatus === "SHIPPED" ? "Shipped" : "Not shipped"}
            </Badge>
            {order.shippingTrackingNumber && (
              <Badge variant="outline" className="font-mono text-[10px]">
                {order.shippingTrackingNumber}
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" />
            Ordered {new Date(order.createdOn).toLocaleDateString()}
            {order.orderNumber && <span className="ml-1">• Squarespace #{order.orderNumber}</span>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4 px-4 py-4 md:px-5">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Total Qty
              </p>
              <p className="mt-1 flex items-center gap-1 text-lg font-bold text-foreground">
                <Package2 className="h-4 w-4 text-muted-foreground" />
                {totalQuantity}
              </p>
            </div>
            <div className="rounded-lg border border-slate-200/70 bg-slate-100/70 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
              <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                Sizes
              </p>
              <p className="mt-1 truncate text-sm font-semibold text-foreground">
                {sortedSizeBreakdown.map(([size, qty]) => `${size} (${qty})`).join(" · ")}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-xl border border-slate-200/70 bg-background/90 p-3 dark:border-slate-800"
              >
                {item.imageUrl ? (
                  <div className="h-14 w-14 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-md bg-muted">
                    <PackageCheck className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.productName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="h-6 rounded-md border-blue-200 bg-blue-50 px-2 text-[10px] font-semibold text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300"
                    >
                      <Ruler className="mr-1 h-3 w-3" />
                      {item.size || "No size"}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="h-6 rounded-md border-emerald-200 bg-emerald-50 px-2 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
                    >
                      <Hash className="mr-1 h-3 w-3" />
                      Qty {item.quantity}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {lastActivity && (
            <>
              <Separator />
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {lastActivity.userName ? (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={lastActivity.userImage || undefined} />
                      <AvatarFallback className="text-[10px]">
                        {lastActivity.userName.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate">
                      {formatAction(lastActivity.action)} by{" "}
                      <span className="font-medium text-foreground">{lastActivity.userName}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="text-[10px]">S</AvatarFallback>
                    </Avatar>
                    <span>
                      {formatAction(lastActivity.action)} by{" "}
                      <span className="font-medium text-foreground">Server</span>
                    </span>
                  </>
                )}
                <span className="ml-auto shrink-0">
                  {formatRelativeTime(lastActivity.createdAt)}
                </span>
              </div>
            </>
          )}
        </CardContent>

        <CardFooter className="border-t px-4 py-3 md:px-5">{renderActions()}</CardFooter>
      </Card>

      <ShippingModal
        key={`${order.id}-${order.shippingTrackingNumber || "none"}-${shippingModalOpen ? "open" : "closed"}`}
        order={order}
        open={shippingModalOpen}
        onOpenChange={setShippingModalOpen}
        saving={savingShipping}
        onSubmit={handleShippingSubmit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete order?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes order #{order.orderNumber ?? "unknown"} and all its line items from the
              dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <Button
              onClick={handleDelete}
              disabled={deleting}
              variant="destructive"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete order"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
