import * as React from "react";
import { EmailLayout, OrderBadge, OrderItemsTable, colors, type OrderItem } from "./layout";

export interface OrderPackedProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
}

export const OrderPacked: React.FC<OrderPackedProps> = ({ customerName, orderNumber, items }) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <EmailLayout previewText={`Order #${orderNumber} is packed and ready to collect!`}>
      {/* Status pill */}
      <div style={{ marginBottom: "24px" }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: colors.blueLight,
            border: `1px solid ${colors.blueBorder}`,
            color: colors.blue,
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Ready for Pickup
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
        Your order is ready, {customerName}!
      </h1>
      <p
        style={{ margin: "0 0 32px 0", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}
      >
        Your order has been packed and is ready to collect from the AUES stall. Show this email (or
        your order number) when you come to pick it up.
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

      {/* Pickup instructions */}
      <div
        style={{
          backgroundColor: colors.redLight,
          border: `1px solid ${colors.redBorder}`,
          borderRadius: "10px",
          padding: "16px 20px",
          marginTop: "24px",
        }}
      >
        <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: 600, color: colors.red }}>
          How to collect
        </p>
        <p style={{ margin: 0, fontSize: "13px", color: colors.textMuted, lineHeight: 1.6 }}>
          Head to the AUES stall and show this email or quote your order number{" "}
          <strong style={{ color: colors.text }}>#{orderNumber}</strong>. Our team will have your
          order ready to hand over.
        </p>
      </div>
    </EmailLayout>
  );
};
