"use client";

import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  MoreHorizontal,
  Package2,
  PackageCheck,
  PackageX,
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
      <Card className="flex flex-col overflow-hidden border-slate-200/80 bg-linear-to-b from-white to-slate-50/50 py-0 shadow-sm transition-shadow hover:shadow-md dark:border-slate-800 dark:from-slate-950 dark:to-slate-950/70">
        {/* Header: name, code, menu */}
        <CardHeader className="px-4 pb-0 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <CardTitle className="truncate text-sm font-semibold">
                  {order.customerName}
                </CardTitle>
                <Badge
                  variant="outline"
                  className="shrink-0 rounded-md px-1.5 font-mono text-[10px] text-muted-foreground"
                >
                  #{customerOrderCode}
                </Badge>
              </div>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{order.customerEmail}</p>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon-sm" className="-mr-1 -mt-1 shrink-0 rounded-md">
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

          {/* Status badges row */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Badge
              variant="outline"
              className={`text-[10px] font-semibold ${getFulfillmentBadgeClasses(order.fulfillmentStatus)}`}
            >
              {order.fulfillmentStatus}
            </Badge>
            {order.shippingStatus === "SHIPPED" ? (
              <Badge
                variant="outline"
                className="border-emerald-200 bg-emerald-50 text-[10px] font-semibold text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300"
              >
                <Truck className="mr-1 h-3 w-3" />
                Shipped
              </Badge>
            ) : (
              <Badge variant="secondary" className="text-[10px]">
                Not shipped
              </Badge>
            )}
            {order.shippingTrackingNumber && (
              <Badge variant="outline" className="max-w-30 truncate font-mono text-[10px]">
                {order.shippingTrackingNumber}
              </Badge>
            )}
          </div>
        </CardHeader>

        {/* Items */}
        <CardContent className="flex-1 px-4 pb-0 pt-3">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/60 p-2.5 dark:border-slate-800/60 dark:bg-slate-900/40"
              >
                {item.imageUrl ? (
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-muted">
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Package2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium leading-snug">{item.productName}</p>
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span className="inline-flex items-center rounded-md bg-blue-100/80 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                      {item.size || "No size"}
                    </span>
                    <span className="text-[11px] font-medium text-muted-foreground">
                      Qty {item.quantity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer metadata */}
          <div className="mt-3 flex items-center gap-1.5 border-t border-slate-100 pt-3 pb-1 text-[11px] text-muted-foreground dark:border-slate-800/60">
            {lastActivity ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1.5 min-w-0 cursor-default">
                    <Avatar className="h-4 w-4 shrink-0">
                      {lastActivity.userName ? (
                        <>
                          <AvatarImage src={lastActivity.userImage || undefined} />
                          <AvatarFallback className="text-[8px]">
                            {lastActivity.userName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </>
                      ) : (
                        <AvatarFallback className="text-[8px]">S</AvatarFallback>
                      )}
                    </Avatar>
                    <span className="truncate">
                      {formatAction(lastActivity.action)} {formatRelativeTime(lastActivity.createdAt)}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  <p className="font-medium">{lastActivity.userName ?? "System"}</p>
                  <p className="text-muted-foreground">
                    {formatAction(lastActivity.action)} {formatRelativeTime(lastActivity.createdAt)}
                    {lastActivity.details?.oldStatus && lastActivity.details?.newStatus
                      ? ` (${lastActivity.details.oldStatus} → ${lastActivity.details.newStatus})`
                      : ""}
                  </p>
                </TooltipContent>
              </Tooltip>
            ) : (
              <>
                <CalendarDays className="h-3 w-3 shrink-0" />
                <span>{new Date(order.createdOn).toLocaleDateString()}</span>
              </>
            )}
            <span className="ml-auto shrink-0 font-mono text-[10px]">
              {totalQuantity} item{totalQuantity !== 1 ? "s" : ""}
            </span>
          </div>
        </CardContent>

        {/* Actions */}
        <CardFooter className="px-4 pb-4 pt-3">{renderActions()}</CardFooter>
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
