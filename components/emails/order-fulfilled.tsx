import * as React from "react";
import { EmailLayout, OrderBadge, OrderItemsTable, colors, type OrderItem } from "./layout";

export interface OrderFulfilledProps {
  customerName: string;
  orderNumber: string;
  items: OrderItem[];
}

export const OrderFulfilled: React.FC<OrderFulfilledProps> = ({
  customerName,
  orderNumber,
  items,
}) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <EmailLayout previewText={`Order #${orderNumber} fulfilled — enjoy!`}>
      {/* Status pill */}
      <div style={{ marginBottom: "24px" }}>
        <span
          style={{
            display: "inline-block",
            backgroundColor: colors.greenLight,
            border: `1px solid ${colors.greenBorder}`,
            color: colors.green,
            fontSize: "12px",
            fontWeight: 600,
            padding: "4px 12px",
            borderRadius: "9999px",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          Order Fulfilled
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
        All done, {customerName}!
      </h1>
      <p
        style={{ margin: "0 0 32px 0", fontSize: "14px", color: colors.textMuted, lineHeight: 1.6 }}
      >
        Your order has been collected and marked as fulfilled. We hope you love it! Thanks for
        supporting AUES.
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
        Items Collected ({totalItems})
      </p>
      <OrderItemsTable items={items} />
    </EmailLayout>
  );
};
