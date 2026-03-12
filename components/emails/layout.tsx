import * as React from "react";

// Shared inline styles matching AUES brand (red theme, email-safe)
export const colors = {
  red: "#dc2626",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
  white: "#ffffff",
  background: "#f8fafc",
  border: "#e2e8f0",
  text: "#0f172a",
  textMuted: "#64748b",
  textSubtle: "#94a3b8",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  greenBorder: "#bbf7d0",
  amber: "#d97706",
  amberLight: "#fffbeb",
  amberBorder: "#fde68a",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  blueBorder: "#bfdbfe",
};

interface EmailLayoutProps {
  children: React.ReactNode;
  previewText?: string;
}

export const EmailLayout: React.FC<EmailLayoutProps> = ({ children, previewText }) => {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {previewText && <title>{previewText}</title>}
      </head>
      <body
        style={{
          margin: 0,
          padding: 0,
          backgroundColor: colors.background,
          fontFamily:
            "'Geist Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        }}
      >
        {/* Hidden preview text for email clients */}
        {previewText && (
          <div
            style={{
              display: "none",
              maxHeight: 0,
              overflow: "hidden",
              color: colors.background,
              fontSize: "1px",
            }}
          >
            {previewText}
          </div>
        )}

        <table
          width="100%"
          cellPadding={0}
          cellSpacing={0}
          style={{ backgroundColor: colors.background, padding: "40px 16px" }}
        >
          <tbody>
            <tr>
              <td align="center">
                <table
                  width="600"
                  cellPadding={0}
                  cellSpacing={0}
                  style={{ maxWidth: "600px", width: "100%" }}
                >
                  <tbody>
                    {/* Header */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: colors.white,
                          borderRadius: "14px 14px 0 0",
                          borderTop: `1px solid ${colors.border}`,
                          borderLeft: `1px solid ${colors.border}`,
                          borderRight: `1px solid ${colors.border}`,
                          padding: "20px 32px",
                        }}
                      >
                        <img
                          src="https://auesassets.ngrok.dev/auesLogo.png"
                          alt="AUES"
                          width={40}
                          height={40}
                          style={{
                            display: "inline-block",
                            verticalAlign: "middle",
                            marginRight: "12px",
                            objectFit: "contain",
                          }}
                        />
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: 600,
                            color: colors.text,
                            verticalAlign: "middle",
                          }}
                        >
                          Adelaide University Engineering Society
                        </span>
                      </td>
                    </tr>

                    {/* Red accent bar */}
                    <tr>
                      <td style={{ backgroundColor: colors.red, height: "4px" }} />
                    </tr>

                    {/* Content */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: colors.white,
                          borderLeft: `1px solid ${colors.border}`,
                          borderRight: `1px solid ${colors.border}`,
                          padding: "40px 32px",
                        }}
                      >
                        {children}
                      </td>
                    </tr>

                    {/* Footer */}
                    <tr>
                      <td
                        style={{
                          backgroundColor: colors.background,
                          borderRadius: "0 0 14px 14px",
                          border: `1px solid ${colors.border}`,
                          padding: "20px 32px",
                          textAlign: "center",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12px",
                            color: colors.textSubtle,
                            lineHeight: 1.6,
                          }}
                        >
                          Adelaide University Engineering Society
                        </p>
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "12px",
                            color: colors.textSubtle,
                          }}
                        >
                          You received this email because you placed an order with AUES.
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
};

// Shared order item type
export interface OrderItem {
  productName: string;
  size: string | null;
  quantity: number;
}

// Shared order summary table used across templates
export const OrderItemsTable: React.FC<{ items: OrderItem[] }> = ({ items }) => (
  <table
    width="100%"
    cellPadding={0}
    cellSpacing={0}
    style={{
      border: `1px solid ${colors.border}`,
      borderRadius: "10px",
      overflow: "hidden",
      marginTop: "16px",
    }}
  >
    <thead>
      <tr style={{ backgroundColor: colors.background }}>
        <th
          style={{
            padding: "10px 16px",
            textAlign: "left",
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textMuted,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          Item
        </th>
        <th
          style={{
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textMuted,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          Size
        </th>
        <th
          style={{
            padding: "10px 16px",
            textAlign: "center",
            fontSize: "12px",
            fontWeight: 600,
            color: colors.textMuted,
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          Qty
        </th>
      </tr>
    </thead>
    <tbody>
      {items.map((item, i) => (
        <tr key={i} style={{ backgroundColor: i % 2 === 0 ? colors.white : colors.background }}>
          <td
            style={{
              padding: "12px 16px",
              fontSize: "14px",
              color: colors.text,
              borderBottom: i < items.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            {item.productName}
          </td>
          <td
            style={{
              padding: "12px 16px",
              fontSize: "14px",
              color: colors.textMuted,
              textAlign: "center",
              borderBottom: i < items.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            {item.size ?? "—"}
          </td>
          <td
            style={{
              padding: "12px 16px",
              fontSize: "14px",
              color: colors.text,
              fontWeight: 600,
              textAlign: "center",
              borderBottom: i < items.length - 1 ? `1px solid ${colors.border}` : "none",
            }}
          >
            {item.quantity}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

// Order number badge — styled for easy presentation at the stall
export const OrderBadge: React.FC<{ orderNumber: string }> = ({ orderNumber }) => (
  <div
    style={{
      backgroundColor: colors.redLight,
      border: `1px solid ${colors.redBorder}`,
      borderRadius: "10px",
      padding: "16px 24px",
      textAlign: "center",
      marginBottom: "24px",
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
      Order Number
    </p>
    <p
      style={{
        margin: 0,
        fontSize: "28px",
        fontWeight: 700,
        color: colors.red,
        letterSpacing: "0.05em",
      }}
    >
      #{orderNumber}
    </p>
  </div>
);
