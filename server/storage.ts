import {
  users,
  wallets,
  transactions,
  paymentCards,
  automations,
  type User,
  type InsertUser,
  type Wallet,
  type InsertWallet,
  type Transaction,
  type InsertTransaction,
  type PaymentCard,
  type InsertPaymentCard,
  type Automation,
  type InsertAutomation,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Wallet operations
  getWallet(id: string): Promise<Wallet | undefined>;
  getUserWallets(userId: string): Promise<Wallet[]>;
  createWallet(wallet: InsertWallet): Promise<Wallet>;
  updateWalletBalance(id: string, balance: string): Promise<Wallet | undefined>;

  // Transaction operations
  getTransaction(id: string): Promise<Transaction | undefined>;
  getWalletTransactions(walletId: string): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransactionStatus(id: string, status: "pending" | "completed" | "failed"): Promise<Transaction | undefined>;

  // Payment card operations
  getPaymentCard(id: string): Promise<PaymentCard | undefined>;
  getUserPaymentCards(userId: string): Promise<PaymentCard[]>;
  createPaymentCard(card: InsertPaymentCard): Promise<PaymentCard>;
  setDefaultCard(userId: string, cardId: string): Promise<void>;
  deletePaymentCard(id: string): Promise<void>;

  // Automation operations
  getAutomation(id: string): Promise<Automation | undefined>;
  getUserAutomations(userId: string): Promise<Automation[]>;
  createAutomation(automation: InsertAutomation): Promise<Automation>;
  updateAutomationStatus(id: string, status: "active" | "paused" | "completed"): Promise<Automation | undefined>;
  deleteAutomation(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Wallet operations
  async getWallet(id: string): Promise<Wallet | undefined> {
    const [wallet] = await db.select().from(wallets).where(eq(wallets.id, id));
    return wallet || undefined;
  }

  async getUserWallets(userId: string): Promise<Wallet[]> {
    return db.select().from(wallets).where(eq(wallets.userId, userId)).orderBy(desc(wallets.createdAt));
  }

  async createWallet(insertWallet: InsertWallet): Promise<Wallet> {
    const [wallet] = await db.insert(wallets).values(insertWallet).returning();
    return wallet;
  }

  async updateWalletBalance(id: string, balance: string): Promise<Wallet | undefined> {
    const [wallet] = await db
      .update(wallets)
      .set({ balance })
      .where(eq(wallets.id, id))
      .returning();
    return wallet || undefined;
  }

  // Transaction operations
  async getTransaction(id: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async getWalletTransactions(walletId: string): Promise<Transaction[]> {
    return db
      .select()
      .from(transactions)
      .where(eq(transactions.walletId, walletId))
      .orderBy(desc(transactions.createdAt));
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async updateTransactionStatus(
    id: string,
    status: "pending" | "completed" | "failed"
  ): Promise<Transaction | undefined> {
    const [transaction] = await db
      .update(transactions)
      .set({ status })
      .where(eq(transactions.id, id))
      .returning();
    return transaction || undefined;
  }

  // Payment card operations
  async getPaymentCard(id: string): Promise<PaymentCard | undefined> {
    const [card] = await db.select().from(paymentCards).where(eq(paymentCards.id, id));
    return card || undefined;
  }

  async getUserPaymentCards(userId: string): Promise<PaymentCard[]> {
    return db
      .select()
      .from(paymentCards)
      .where(eq(paymentCards.userId, userId))
      .orderBy(desc(paymentCards.isDefault), desc(paymentCards.createdAt));
  }

  async createPaymentCard(insertCard: InsertPaymentCard): Promise<PaymentCard> {
    const [card] = await db.insert(paymentCards).values(insertCard).returning();
    return card;
  }

  async setDefaultCard(userId: string, cardId: string): Promise<void> {
    await db.transaction(async (tx) => {
      await tx.update(paymentCards).set({ isDefault: false }).where(eq(paymentCards.userId, userId));
      await tx.update(paymentCards).set({ isDefault: true }).where(eq(paymentCards.id, cardId));
    });
  }

  async deletePaymentCard(id: string): Promise<void> {
    await db.delete(paymentCards).where(eq(paymentCards.id, id));
  }

  // Automation operations
  async getAutomation(id: string): Promise<Automation | undefined> {
    const [automation] = await db.select().from(automations).where(eq(automations.id, id));
    return automation || undefined;
  }

  async getUserAutomations(userId: string): Promise<Automation[]> {
    return db
      .select()
      .from(automations)
      .where(eq(automations.userId, userId))
      .orderBy(desc(automations.createdAt));
  }

  async createAutomation(insertAutomation: InsertAutomation): Promise<Automation> {
    const [automation] = await db.insert(automations).values(insertAutomation).returning();
    return automation;
  }

  async updateAutomationStatus(
    id: string,
    status: "active" | "paused" | "completed"
  ): Promise<Automation | undefined> {
    const [automation] = await db
      .update(automations)
      .set({ status })
      .where(eq(automations.id, id))
      .returning();
    return automation || undefined;
  }

  async deleteAutomation(id: string): Promise<void> {
    await db.delete(automations).where(eq(automations.id, id));
  }
}

export const storage = new DatabaseStorage();
