"use client";

import { type FormEvent, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Mail } from "lucide-react";
import type { ShirtOrder } from "@/app/actions/squarespace";
import { sendEmailToCustomer } from "@/app/actions/email";
import { toast } from "sonner";

interface EmailCustomerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: ShirtOrder;
}

export function EmailCustomerModal({ open, onOpenChange, order }: EmailCustomerModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    const result = await sendEmailToCustomer({
      to: order.customerEmail,
      customerName: order.customerName,
      subject: subject.trim(),
      message: message.trim(),
    });
    setSending(false);

    if (result.success) {
      toast.success(`Email sent to ${order.customerName}`);
      setSubject("");
      setMessage("");
      onOpenChange(false);
    } else {
      toast.error(result.error || "Failed to send email");
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!sending) {
      if (!open) {
        setSubject("");
        setMessage("");
      }
      onOpenChange(open);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email Customer
          </DialogTitle>
          <DialogDescription>
            Send an email to{" "}
            <span className="font-medium text-foreground">{order.customerName}</span> at{" "}
            <span className="font-medium text-foreground">{order.customerEmail}</span>. They will be
            asked to reply to club@aues.com.au.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor={`email-subject-${order.id}`}>Subject</Label>
            <Input
              id={`email-subject-${order.id}`}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Update on your shirt order"
              autoFocus
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor={`email-message-${order.id}`}>Message</Label>
            <Textarea
              id={`email-message-${order.id}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write your message here..."
              rows={6}
              required
              className="resize-none"
            />
          </div>

          <div className="rounded-md border bg-amber-50 px-3 py-2.5 text-xs text-amber-700 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-400">
            The customer will not be able to reply to this email directly. They will be directed to
            contact <span className="font-semibold">club@aues.com.au</span>.
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={sending || !subject.trim() || !message.trim()}>
              {sending ? "Sending..." : "Send email"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
