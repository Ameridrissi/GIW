// Reference: blueprint:javascript_log_in_with_replit
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertWalletSchema,
  insertTransactionSchema,
  insertPaymentCardSchema,
  insertAutomationSchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Wallet routes
  app.get("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallets = await storage.getUserWallets(userId);
      res.json(wallets);
    } catch (error) {
      console.error("Error fetching wallets:", error);
      res.status(500).json({ message: "Failed to fetch wallets" });
    }
  });

  app.post("/api/wallets", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertWalletSchema.parse({ ...req.body, userId });
      const wallet = await storage.createWallet(validated);
      res.json(wallet);
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      res.status(400).json({ message: error.message || "Failed to create wallet" });
    }
  });

  app.patch("/api/wallets/:id/balance", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { balance } = req.body;
      
      if (!balance || isNaN(parseFloat(balance))) {
        return res.status(400).json({ message: "Invalid balance" });
      }

      const wallet = await storage.updateWalletBalance(id, balance);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  // Transaction routes
  app.get("/api/wallets/:walletId/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const { walletId } = req.params;
      const transactions = await storage.getWalletTransactions(walletId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const validated = insertTransactionSchema.parse(req.body);
      const transaction = await storage.createTransaction(validated);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const transaction = await storage.updateTransactionStatus(id, status);
      if (!transaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(transaction);
    } catch (error) {
      console.error("Error updating transaction status:", error);
      res.status(500).json({ message: "Failed to update transaction status" });
    }
  });

  // Payment card routes
  app.get("/api/cards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cards = await storage.getUserPaymentCards(userId);
      res.json(cards);
    } catch (error) {
      console.error("Error fetching cards:", error);
      res.status(500).json({ message: "Failed to fetch cards" });
    }
  });

  app.post("/api/cards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertPaymentCardSchema.parse({ ...req.body, userId });
      const card = await storage.createPaymentCard(validated);
      res.json(card);
    } catch (error: any) {
      console.error("Error creating card:", error);
      res.status(400).json({ message: error.message || "Failed to create card" });
    }
  });

  app.patch("/api/cards/:id/default", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      await storage.setDefaultCard(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default card:", error);
      res.status(500).json({ message: "Failed to set default card" });
    }
  });

  app.delete("/api/cards/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deletePaymentCard(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting card:", error);
      res.status(500).json({ message: "Failed to delete card" });
    }
  });

  // Automation routes
  app.get("/api/automations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const automations = await storage.getUserAutomations(userId);
      res.json(automations);
    } catch (error) {
      console.error("Error fetching automations:", error);
      res.status(500).json({ message: "Failed to fetch automations" });
    }
  });

  app.post("/api/automations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertAutomationSchema.parse({ ...req.body, userId });
      const automation = await storage.createAutomation(validated);
      res.json(automation);
    } catch (error: any) {
      console.error("Error creating automation:", error);
      res.status(400).json({ message: error.message || "Failed to create automation" });
    }
  });

  app.patch("/api/automations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "paused", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const automation = await storage.updateAutomationStatus(id, status);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      res.json(automation);
    } catch (error) {
      console.error("Error updating automation status:", error);
      res.status(500).json({ message: "Failed to update automation status" });
    }
  });

  app.delete("/api/automations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.deleteAutomation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting automation:", error);
      res.status(500).json({ message: "Failed to delete automation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
