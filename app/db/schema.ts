import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  serial,
  varchar,
  numeric,
  integer,
  jsonb,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "next-auth/adapters";
import { email } from "zod";

// Auth.js Tables (for authentication)

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(), // username for login
  lastName: text("lastName"),
  phoneNumber: text("phoneNumber"),
  password: text("password").notNull(), // hashed password for credentials login

  // Bank details

  bankName: text("bankName"),
  BSB: text("BSB"),
  accountNumber: text("accountNumber"),
  accountName: text("accountName"),

  role: text("role")
    .$type<"General" | "Admin" | "Treasurer" | "Temporary">()
    .notNull()
    .default("General"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),

  accountSetupComplete: boolean("accountSetupComplete").notNull().default(false),
  // NextAuth adapter requires these fields even if unused
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const userCustomisations = pgTable(
  "user_customizations",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    // Light mode colors
    lightPrimaryColor: text("lightPrimaryColor").notNull().default("#2563eb"),
    lightSecondaryColor: text("lightSecondaryColor").notNull().default("#10b981"),
    // Dark mode colors
    darkPrimaryColor: text("darkPrimaryColor").notNull().default("#3b82f6"),
    darkSecondaryColor: text("darkSecondaryColor").notNull().default("#22c55e"),
    // Theme preference
    theme: text("theme").$type<"light" | "dark" | "system">().notNull().default("system"),
  },
  (userCustomizations) => [
    primaryKey({
      columns: [userCustomizations.userId],
    }),
  ],
);

export const accounts = pgTable(
  "accounts",
  {
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: uuid("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

// Members and Membership Responses Tables

export const members = pgTable("members", {
  id: serial("id").primaryKey(),
  fullname: varchar("fullname", { length: 150 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phonenumber: varchar("phonenumber", { length: 64 }),
  membershipId: varchar("membership_id", { length: 50 }).unique(),
  membershipType: varchar("membership_type", { length: 50 }),
  pricePaid: numeric("price_paid", { precision: 8, scale: 2 }),
  paymentMethod: varchar("payment_method", { length: 50 }),
  isValid: boolean("is_valid").default(false),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

export const membershipResponses = pgTable("membership_responses", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .references(() => members.id)
    .notNull(),
  responses: jsonb("responses"), // full Firebase form block
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

export const membersRelations = relations(members, ({ many }) => ({
  responses: many(membershipResponses),
}));

export const membershipResponsesRelations = relations(membershipResponses, ({ one }) => ({
  member: one(members, {
    fields: [membershipResponses.memberId],
    references: [members.id],
  }),
}));

// OPTIONAL: PAYMENT TRACKING
export const membershipPayments = pgTable("membership_payments", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id")
    .references(() => members.id)
    .notNull(),
  amount: numeric("amount", { precision: 8, scale: 2 }),
  method: varchar("method", { length: 50 }),
  status: varchar("status", { length: 50 }).default("pending"),
  transactionId: varchar("transaction_id", { length: 100 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow(),
});

export const membershipPaymentsRelations = relations(membershipPayments, ({ one }) => ({
  member: one(members, {
    fields: [membershipPayments.memberId],
    references: [members.id],
  }),
}));

// Receipt Reimbursement System
export const receiptReimbursements = pgTable("receipt_reimbursements", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  // Receipt details
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  receiptImageUrl: text("receipt_image_url").notNull(),

  // Approval details
  requiresPriorApproval: boolean("requires_prior_approval").notNull().default(false),
  approvedByUserId: uuid("approved_by_user_id").references(() => users.id),

  // Status tracking
  status: text("status").$type<"Pending" | "Fulfilled" | "Rejected">().notNull().default("Pending"),

  // Treasurer notes
  treasurerNotes: text("treasurer_notes"),
  processedByUserId: uuid("processed_by_user_id").references(() => users.id),
  processedAt: timestamp("processed_at", { withTimezone: true, mode: "date" }),

  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const receiptReimbursementsRelations = relations(receiptReimbursements, ({ one }) => ({
  user: one(users, {
    fields: [receiptReimbursements.userId],
    references: [users.id],
  }),
  approvedBy: one(users, {
    fields: [receiptReimbursements.approvedByUserId],
    references: [users.id],
  }),
  processedBy: one(users, {
    fields: [receiptReimbursements.processedByUserId],
    references: [users.id],
  }),
}));

// Squarespace Orders Table
export const squarespaceOrders = pgTable(
  "squarespace_orders",
  {
    id: text("id").primaryKey(), // Squarespace internal order ID
    orderNumber: text("order_number"), // Customer-facing order number (e.g., 1001234)
    customerEmail: text("customer_email").notNull(),
    customerName: text("customer_name").notNull(),
    fulfillmentStatus: text("fulfillment_status")
      .$type<"PENDING" | "PACKED" | "FULFILLED">()
      .notNull()
      .default("PENDING"),

    // Shipping
    shippingStatus: text("shipping_status")
      .$type<"PENDING" | "SHIPPED">()
      .notNull()
      .default("PENDING"),
    shippingTrackingNumber: text("shipping_tracking_number"),
    shippingCarrier: text("shipping_carrier").default("auspost"),
    shippedAt: timestamp("shipped_at", { withTimezone: true, mode: "date" }),

    createdOn: timestamp("created_on", { withTimezone: true, mode: "date" }).notNull(),
    syncedAt: timestamp("synced_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => ({
    statusCreatedIdx: index("sq_orders_status_created_idx").on(
      table.fulfillmentStatus,
      table.createdOn,
    ),
    orderNumberIdx: index("sq_orders_order_number_idx").on(table.orderNumber),
    customerEmailIdx: index("sq_orders_customer_email_idx").on(table.customerEmail),
    customerNameIdx: index("sq_orders_customer_name_idx").on(table.customerName),
    syncedAtIdx: index("sq_orders_synced_at_idx").on(table.syncedAt),
  }),
);

// Squarespace Order Items Table
export const squarespaceOrderItems = pgTable(
  "squarespace_order_items",
  {
    id: serial("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => squarespaceOrders.id, { onDelete: "cascade" }),
    productName: text("product_name").notNull(),
    quantity: integer("quantity").notNull().default(1),
    size: text("size"),
    imageUrl: text("image_url"),
  },
  (table) => ({
    orderIdIdx: index("sq_order_items_order_id_idx").on(table.orderId),
    productNameIdx: index("sq_order_items_product_name_idx").on(table.productName),
    sizeIdx: index("sq_order_items_size_idx").on(table.size),
  }),
);

export const squarespaceOrdersRelations = relations(squarespaceOrders, ({ many }) => ({
  items: many(squarespaceOrderItems),
}));

export const squarespaceOrderItemsRelations = relations(squarespaceOrderItems, ({ one }) => ({
  order: one(squarespaceOrders, {
    fields: [squarespaceOrderItems.orderId],
    references: [squarespaceOrders.id],
  }),
}));

// Site Settings Table (singleton - only one row)
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),

  // QPay/Rubric API settings (encrypted)
  qpayUrl: text("qpay_url"),
  qpayEmail: text("qpay_email"),
  qpaySessionId: text("qpay_session_id"),
  qpayMembershipName: text("qpay_membership_name"),

  // Squarespace API settings (encrypted)
  squarespaceApiKey: text("squarespace_api_key"),
  squarespaceApiUrl: text("squarespace_api_url"),
  squarespaceApiVersion: text("squarespace_api_version"),

  // Pub Crawl settings (encrypted)
  pubcrawlShirtKeyword: text("pubcrawl_shirt_keyword"),

  // Sync metadata (not encrypted)
  lastSquarespaceOrderDate: timestamp("last_squarespace_order_date", {
    withTimezone: true,
    mode: "date",
  }),

  // Timestamps
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

// Activity Log Action Types
export type ActivityActionType =
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "USER_ROLE_CHANGED"
  | "SETTINGS_UPDATED"
  | "ORDER_SYNCED"
  | "ORDER_STATUS_UPDATED"
  | "ORDER_PACKED"
  | "ORDER_FULFILLED"
  | "RECEIPT_SUBMITTED"
  | "RECEIPT_APPROVED"
  | "RECEIPT_REJECTED"
  | "RECEIPT_FULFILLED"
  | "MEMBER_SYNCED"
  | "LOGIN"
  | "LOGOUT";

// Activity Log Table - tracks all user actions
export const activityLog = pgTable("activity_log", {
  id: uuid("id").defaultRandom().primaryKey(),

  // Who performed the action
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  userName: text("user_name"), // Store name in case user is deleted

  // What action was performed
  action: text("action").$type<ActivityActionType>().notNull(),

  // What entity was affected (optional)
  entityType: text("entity_type"), // 'user', 'order', 'receipt', 'settings', etc.
  entityId: text("entity_id"), // ID of the affected entity

  // Additional details about the action (JSON)
  details: jsonb("details"), // e.g., { oldStatus: 'PENDING', newStatus: 'PACKED' }

  // When it happened
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  user: one(users, {
    fields: [activityLog.userId],
    references: [users.id],
  }),
}));
