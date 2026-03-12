import React from "react";
import { Resend } from "resend";
import {
  OrderReceived,
  OrderPacked,
  OrderFulfilled,
  OrderShipped,
  type OrderItem,
} from "@/components/email-template";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

const FROM = "AUES <noreply@support.aues.com.au>";

interface OrderEmailBase {
  to: string;
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
}

// In dev, override recipient with RESEND_TEST_EMAIL so test-domain sends work.
// Resend's onboarding@resend.dev can only deliver to your own account email.
function resolveRecipient(to: string): string {
  if (process.env.RESEND_TEST_EMAIL) return process.env.RESEND_TEST_EMAIL;
  return to;
}

function safeEmailSend(fn: () => Promise<unknown>, label: string, to: string) {
  console.log(`[email] Sending ${label} → ${to}`);
  fn()
    .then(() => console.log(`[email] ✓ ${label} sent to ${to}`))
    .catch((err) => console.error(`[email] ✗ ${label} failed:`, err));
}

export function sendOrderReceivedEmail(args: OrderEmailBase) {
  safeEmailSend(
    () =>
      getResend().emails.send({
        from: FROM,
        to: [resolveRecipient(args.to)],
        subject: `Order #${args.orderNumber} received — we're getting it ready!`,
        react: React.createElement(OrderReceived, {
          customerName: args.customerName,
          orderNumber: args.orderNumber,
          items: args.items,
        }),
      }),
    "order-received",
    resolveRecipient(args.to),
  );
}

export function sendOrderPackedEmail(args: OrderEmailBase) {
  safeEmailSend(
    () =>
      getResend().emails.send({
        from: FROM,
        to: [resolveRecipient(args.to)],
        subject: `Order #${args.orderNumber} is packed and ready to collect!`,
        react: React.createElement(OrderPacked, {
          customerName: args.customerName,
          orderNumber: args.orderNumber,
          items: args.items,
        }),
      }),
    "order-packed",
    resolveRecipient(args.to),
  );
}

export function sendOrderFulfilledEmail(args: OrderEmailBase) {
  safeEmailSend(
    () =>
      getResend().emails.send({
        from: FROM,
        to: [resolveRecipient(args.to)],
        subject: `Order #${args.orderNumber} — all done, enjoy!`,
        react: React.createElement(OrderFulfilled, {
          customerName: args.customerName,
          orderNumber: args.orderNumber,
          items: args.items,
        }),
      }),
    "order-fulfilled",
    resolveRecipient(args.to),
  );
}

export function sendOrderShippedEmail(
  args: OrderEmailBase & { trackingNumber: string; carrier?: string },
) {
  safeEmailSend(
    () =>
      getResend().emails.send({
        from: FROM,
        to: [resolveRecipient(args.to)],
        subject: `Order #${args.orderNumber} is on its way — tracking: ${args.trackingNumber}`,
        react: React.createElement(OrderShipped, {
          customerName: args.customerName,
          orderNumber: args.orderNumber,
          items: args.items,
          trackingNumber: args.trackingNumber,
          carrier: args.carrier,
        }),
      }),
    "order-shipped",
    resolveRecipient(args.to),
  );
}
