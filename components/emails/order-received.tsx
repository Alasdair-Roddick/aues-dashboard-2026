import * as React from "react";
import { EmailLayout, OrderBadge, OrderItemsTable, colors, type OrderItem } from "./layout";

export interface OrderReceivedProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
}

export const OrderReceived: React.FC<OrderReceivedProps> = ({
  customerName,
  orderNumber,
  items,
}) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <EmailLayout previewText={`Order #${orderNumber} received — we're getting it ready!`}>
      {/* Status pill */}
      <div style={{ marginBottom: "24px" }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: colors.amberLight,
            border: `1px solid ${colors.amberBorder}`,
            color: colors.amber,
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Order Received
        </span>
      </div>

      <h1
        style={{
          margin: "0 0 8px 0",
          fontSize: "24px",
          fontWeight: 700,
          color: colors.text,
          lineHeight: 1.3,
        }}
      >
        Thanks, {customerName}!
      </h1>
      <p
        style={{ margin: "0 0 32px 0", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}
      >
        We&apos;ve received your order and we&apos;re getting it ready. You&apos;ll hear from us
        again when it&apos;s packed and ready to collect from the AUES stall.
      </p>

      <OrderBadge orderNumber={orderNumber} />

      <p
        style={{
          margin: "0 0 8px 0",
          fontSize: "13px",
          fontWeight: 600,
          color: colors.textMuted,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        Your Items ({totalItems})
      </p>
      <OrderItemsTable items={items} />

      <p
        style={{ margin: "32px 0 0 0", fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}
      >
        Keep this email handy — you&apos;ll need to show your order number when collecting from the
        stall.
      </p>
    </EmailLayout>
  );
};
