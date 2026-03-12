// Re-export email templates from the emails folder
export { OrderReceived } from "./emails/order-received";
export { OrderPacked } from "./emails/order-packed";
export { OrderFulfilled } from "./emails/order-fulfilled";
export { OrderShipped } from "./emails/order-shipped";
export { CustomEmail } from "./emails/custom-email";
export type { OrderReceivedProps } from "./emails/order-received";
export type { OrderPackedProps } from "./emails/order-packed";
export type { OrderFulfilledProps } from "./emails/order-fulfilled";
export type { OrderShippedProps } from "./emails/order-shipped";
export type { CustomEmailProps } from "./emails/custom-email";
export type { OrderItem } from "./emails/layout";
