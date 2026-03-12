import * as React from "react";
import { EmailLayout, OrderBadge, OrderItemsTable, colors, type OrderItem } from "./layout";

export interface OrderShippedProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
  trackingNumber: string;
  carrier?: string; // defaults to "Australia Post"
}

export const OrderShipped: React.FC<OrderShippedProps> = ({
  customerName,
  orderNumber,
  items,
  trackingNumber,
  carrier = "Australia Post",
}) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Australia Post tracking URL
  const trackingUrl = `https://auspost.com.au/mypost/track/#/details/${trackingNumber}`;

  return (
    <EmailLayout previewText={`Order #${orderNumber} is on its way — tracking: ${trackingNumber}`}>
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
          Out for Delivery
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
        Your order is on its way, {customerName}!
      </h1>
      <p
        style={{ margin: "0 0 32px 0", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}
      >
        Your order has been dispatched via {carrier}. Use the tracking number below to follow your
        parcel.
      </p>

      <OrderBadge orderNumber={orderNumber} />

      {/* Tracking card */}
      <div
        style={{
          backgroundColor: colors.blueLight,
          border: `1px solid ${colors.blueBorder}`,
          borderRadius: "10px",
          padding: "20px 24px",
          marginBottom: "24px",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: "0 0 4px 0",
            fontSize: "12px",
            color: colors.textMuted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 600,
          }}
        >
          {carrier} Tracking Number
        </p>
        <p
          style={{
            margin: "0 0 16px 0",
            fontSize: "22px",
            fontWeight: 700,
            color: colors.blue,
            letterSpacing: "0.05em",
          }}
        >
          {trackingNumber}
        </p>
        <a
          href={trackingUrl}
          style={{
            display: "inline-block",
            backgroundColor: colors.blue,
            color: colors.white,
            textDecoration: "none",
            fontSize: "14px",
            fontWeight: 500,
            padding: "10px 20px",
            borderRadius: "6px",
          }}
        >
          Track My Parcel
        </a>
      </div>

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
        Items Shipped ({totalItems})
      </p>
      <OrderItemsTable items={items} />
    </EmailLayout>
  );
};
