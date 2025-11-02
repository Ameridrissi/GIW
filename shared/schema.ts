import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, numeric, boolean, pgEnum, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  circleUserToken: text("circle_user_token"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const wallets = pgTable("wallets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address").notNull().unique(),
  balance: numeric("balance", { precision: 20, scale: 6 }).notNull().default("0"),
  isLinked: boolean("is_linked").notNull().default(false),
  circleWalletId: text("circle_wallet_id"),
  blockchain: text("blockchain").default("MATIC-AMOY"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const transactionTypeEnum = pgEnum("transaction_type", ["sent", "received"]);
export const transactionStatusEnum = pgEnum("transaction_status", ["pending", "completed", "failed"]);

export const transactions = pgTable("transactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  merchant: text("merchant").notNull(),
  category: text("category").notNull(),
  amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
  status: transactionStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cardTypeEnum = pgEnum("card_type", ["visa", "mastercard", "amex"]);

export const paymentCards = pgTable("payment_cards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: cardTypeEnum("type").notNull(),
  last4: text("last4").notNull(),
  expiry: text("expiry").notNull(),
  cardholderName: text("cardholder_name").notNull(),
  isDefault: boolean("is_default").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const automationTypeEnum = pgEnum("automation_type", ["recurring", "scheduled", "savings"]);
export const automationStatusEnum = pgEnum("automation_status", ["active", "paused", "completed"]);

export const automations = pgTable("automations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  walletId: varchar("wallet_id").notNull().references(() => wallets.id, { onDelete: "cascade" }),
  type: automationTypeEnum("type").notNull(),
  name: text("name").notNull(),
  amount: numeric("amount", { precision: 20, scale: 6 }).notNull(),
  recipient: text("recipient"),
  frequency: text("frequency"),
  nextRunDate: timestamp("next_run_date"),
  status: automationStatusEnum("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  wallets: many(wallets),
  paymentCards: many(paymentCards),
  automations: many(automations),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(transactions),
  automations: many(automations),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [transactions.walletId],
    references: [wallets.id],
  }),
}));

export const paymentCardsRelations = relations(paymentCards, ({ one }) => ({
  user: one(users, {
    fields: [paymentCards.userId],
    references: [users.id],
  }),
}));

export const automationsRelations = relations(automations, ({ one }) => ({
  user: one(users, {
    fields: [automations.userId],
    references: [users.id],
  }),
  wallet: one(wallets, {
    fields: [automations.walletId],
    references: [wallets.id],
  }),
}));

// Insert schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  balance: true,
  address: true,
}).extend({
  name: z.string().min(1).max(100),
  isLinked: z.boolean().default(false),
});

export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
}).extend({
  merchant: z.string().min(1),
  category: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
});

export const insertPaymentCardSchema = createInsertSchema(paymentCards).omit({
  id: true,
  createdAt: true,
}).extend({
  last4: z.string().length(4).regex(/^\d{4}$/),
  expiry: z.string().regex(/^\d{2}\/\d{2}$/),
  cardholderName: z.string().min(1),
  isDefault: z.boolean().default(false),
});

export const insertAutomationSchema = createInsertSchema(automations).omit({
  id: true,
  createdAt: true,
}).extend({
  name: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d{1,6})?$/),
  recipient: z.string().optional(),
  frequency: z.string().optional(),
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertWallet = z.infer<typeof insertWalletSchema>;
export type Wallet = typeof wallets.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

export type InsertPaymentCard = z.infer<typeof insertPaymentCardSchema>;
export type PaymentCard = typeof paymentCards.$inferSelect;

export type InsertAutomation = z.infer<typeof insertAutomationSchema>;
export type Automation = typeof automations.$inferSelect;
