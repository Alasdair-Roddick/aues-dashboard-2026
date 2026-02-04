"use client";

import { type FormEvent, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import type { ShirtOrder } from "@/app/actions/squarespace";
import { Truck } from "lucide-react";

interface ShippingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ShirtOrder;
  saving?: boolean;
  onSubmit: (trackingNumber: string, carrier?: string) => Promise<void> | void;
}

export function ShippingModal({
  open,
  onOpenChange,
  order,
  saving = false,
  onSubmit,
}: ShippingModalProps) {
  const [trackingNumber, setTrackingNumber] = useState(
    () => order.shippingTrackingNumber || ""
  );

  const trackingLink = useMemo(() => {
    const trimmed = trackingNumber.trim();
    if (!trimmed) return null;
    return `https://auspost.com.au/mypost/track/#/details/${encodeURIComponent(trimmed)}`;
  }, [trackingNumber]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = trackingNumber.trim();
    if (!trimmed || saving) return;

    await onSubmit(trimmed, "auspost");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Add AusPost Shipping
          </DialogTitle>
          <DialogDescription>
            Save the Australia Post tracking number for order #{order.orderNumber ?? "unknown"}.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border border-slate-200/70 bg-muted/30 p-3 dark:border-slate-800">
            <p className="text-xs text-muted-foreground">Order</p>
            <p className="text-sm font-semibold">#{order.orderNumber ?? "unknown"}</p>
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px] uppercase tracking-wide">
                Australia Post
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`tracking-${order.id}`}>Tracking Number</Label>
            <Input
              id={`tracking-${order.id}`}
              value={trackingNumber}
              onChange={(event) => setTrackingNumber(event.target.value)}
              placeholder="e.g. RZ123456789AU"
              autoFocus
              required
            />
          </div>

          <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
            Carrier: <span className="font-medium text-foreground">Australia Post</span>
            {trackingLink && (
              <>
                {" · "}
                <a
                  href={trackingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="underline underline-offset-2"
                >
                  Check tracking link
                </a>
              </>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !trackingNumber.trim()}>
              {saving ? "Saving..." : "Mark as shipped"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
