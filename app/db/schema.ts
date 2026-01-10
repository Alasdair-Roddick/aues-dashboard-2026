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
  primaryKey,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type { AdapterAccountType } from "next-auth/adapters";
import { email } from 'zod';



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

    role: text("role").$type<'General' | 'Admin' | 'Temporary'>().notNull().default('General'),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),


    accountSetupComplete: boolean("accountSetupComplete").notNull().default(false),
    // NextAuth adapter requires these fields even if unused
    email: text("email").unique(),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
});


export const userCustomisations = pgTable("user_customizations", {
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
  ]
);

export const accounts = pgTable("accounts", {
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
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: uuid("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verificationToken", {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ]
);

export const authenticators = pgTable("authenticator", {
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
  ]
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
  memberId: integer("member_id").references(() => members.id).notNull(),
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
  memberId: integer("member_id").references(() => members.id).notNull(),
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