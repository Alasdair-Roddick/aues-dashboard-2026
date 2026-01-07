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
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';





// Users Table

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    role: text("role").$type<'General' | 'Admin' | 'Temporary'>().notNull().default('General').notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});








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
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const membershipResponses = pgTable("membership_responses", {
  id: serial("id").primaryKey(),
  memberId: integer("member_id").references(() => members.id).notNull(),
  responses: jsonb("responses"), // full Firebase form block
  createdAt: timestamp("created_at").defaultNow(),
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
  createdAt: timestamp("created_at").defaultNow(),
});

export const membershipPaymentsRelations = relations(membershipPayments, ({ one }) => ({
  member: one(members, {
    fields: [membershipPayments.memberId],
    references: [members.id],
  }),
}));