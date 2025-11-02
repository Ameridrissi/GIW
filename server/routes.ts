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
import { circleService } from "./circleService";

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
      
      // Always get a fresh Circle user token (tokens expire after 60 minutes)
      // This creates the Circle user if needed and always returns a fresh token
      const circleUserToken = await circleService.createUser(userId);
      
      // Store the Circle user ID for reference (token is not cached)
      await storage.updateUserCircleData(userId, circleUserToken, userId);
      
      // Create wallet with Circle (returns challenge data for PIN setup)
      const challengeData = await circleService.createUserPinWithWallets(circleUserToken);
      console.log('[Wallet Creation] Challenge data received:', { hasChallenge: !!challengeData.challengeId });
      
      // Fetch Circle wallets to get the actual wallet ID and address
      const circleWallets = await circleService.getUserWallets(circleUserToken);
      console.log('[Wallet Creation] Circle wallets fetched:', { count: circleWallets.length, wallets: circleWallets });
      
      const latestWallet = circleWallets.sort((a: any, b: any) => {
        const timeA = a.createDate || a.createdDate || 0;
        const timeB = b.createDate || b.createdDate || 0;
        return timeB - timeA;
      })[0];
      console.log('[Wallet Creation] Latest wallet:', latestWallet);
      
      // Use Circle wallet data if available, otherwise use temporary data
      const walletAddress = latestWallet?.address || `0x${Array.from({ length: 40 }, () => 
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;
      const circleWalletId = latestWallet?.id || null;
      console.log('[Wallet Creation] Using:', { address: walletAddress, circleWalletId });
      
      // Store wallet in database with Circle data
      const wallet = await storage.createWallet({ 
        ...validated, 
        address: walletAddress,
        circleWalletId: circleWalletId,
        requiresPinSetup: true,  // Mark as requiring PIN setup
        blockchain: "ARC-TESTNET",
        accountType: "SCA",
      });
      
      // Return wallet with full challenge data for frontend PIN setup
      res.json({ 
        wallet,
        challengeId: challengeData.challengeId,
        userToken: challengeData.userToken,
        encryptionKey: challengeData.encryptionKey,
        requiresPinSetup: true 
      });
    } catch (error: any) {
      console.error("Error creating wallet:", error);
      res.status(400).json({ message: error.message || "Failed to create wallet" });
    }
  });

  app.patch("/api/wallets/:id/complete-setup", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const existingWallet = await storage.getWallet(id);
      if (!existingWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (existingWallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get a fresh Circle user token (tokens expire after 60 minutes)
      const circleUserToken = await circleService.createUser(userId);

      // Fetch Circle wallets to get real wallet data
      const circleWallets = await circleService.getUserWallets(circleUserToken);
      if (circleWallets.length === 0) {
        return res.status(400).json({ message: "No Circle wallets found" });
      }

      // Find the most recently created Circle wallet on the same blockchain
      // Sort by creation time and match blockchain
      const matchingWallet = circleWallets
        .filter(w => w.blockchain === existingWallet.blockchain)
        .sort((a: any, b: any) => {
          const timeA = a.createDate || a.createdDate || 0;
          const timeB = b.createDate || b.createdDate || 0;
          return timeB - timeA;
        })[0];

      if (!matchingWallet) {
        return res.status(400).json({ message: "No matching Circle wallet found" });
      }

      // Update our database wallet with Circle data
      const wallet = await storage.updateWalletCircleData(
        id,
        matchingWallet.id,
        matchingWallet.address,
        false  // PIN setup is now complete
      );

      res.json(wallet);
    } catch (error) {
      console.error("Error completing wallet setup:", error);
      res.status(500).json({ message: "Failed to complete wallet setup" });
    }
  });

  app.post("/api/wallets/:id/sync-balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const existingWallet = await storage.getWallet(id);
      if (!existingWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (existingWallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      // Get a fresh Circle user token (tokens expire after 60 minutes)
      const circleUserToken = await circleService.createUser(userId);
      
      if (!existingWallet.circleWalletId) {
        return res.status(400).json({ message: "Wallet not fully set up" });
      }

      // Fetch balance from Circle
      const balances = await circleService.getWalletBalance(circleUserToken, existingWallet.circleWalletId);
      
      // Find USDC balance
      let usdcBalance = "0";
      for (const tokenBalance of balances) {
        if (tokenBalance.token?.symbol === "USDC") {
          usdcBalance = tokenBalance.amount || "0";
          break;
        }
      }

      // Update database
      const wallet = await storage.updateWalletBalance(id, usdcBalance);
      res.json(wallet);
    } catch (error) {
      console.error("Error syncing wallet balance:", error);
      res.status(500).json({ message: "Failed to sync balance" });
    }
  });

  app.patch("/api/wallets/:id/balance", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { balance } = req.body;
      
      if (balance === undefined || balance === null || isNaN(parseFloat(balance))) {
        return res.status(400).json({ message: "Invalid balance" });
      }

      // Verify ownership
      const existingWallet = await storage.getWallet(id);
      if (!existingWallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (existingWallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const wallet = await storage.updateWalletBalance(id, balance);
      res.json(wallet);
    } catch (error) {
      console.error("Error updating wallet balance:", error);
      res.status(500).json({ message: "Failed to update balance" });
    }
  });

  // Transaction routes
  app.get("/api/wallets/:walletId/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { walletId } = req.params;
      
      // Verify wallet ownership
      const wallet = await storage.getWallet(walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (wallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const transactions = await storage.getWalletTransactions(walletId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      res.status(500).json({ message: "Failed to fetch transactions" });
    }
  });

  app.post("/api/transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validated = insertTransactionSchema.parse(req.body);
      
      // Verify wallet ownership
      const wallet = await storage.getWallet(validated.walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (wallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const transaction = await storage.createTransaction(validated);
      res.json(transaction);
    } catch (error: any) {
      console.error("Error creating transaction:", error);
      res.status(400).json({ message: error.message || "Failed to create transaction" });
    }
  });

  app.patch("/api/transactions/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;

      if (!["pending", "completed", "failed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify ownership via wallet
      const existing = await storage.getTransaction(id);
      if (!existing) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      
      const wallet = await storage.getWallet(existing.walletId);
      if (!wallet || wallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const transaction = await storage.updateTransactionStatus(id, status);
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
      
      // Verify card ownership
      const card = await storage.getPaymentCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      if (card.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.setDefaultCard(userId, id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default card:", error);
      res.status(500).json({ message: "Failed to set default card" });
    }
  });

  app.delete("/api/cards/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify card ownership
      const card = await storage.getPaymentCard(id);
      if (!card) {
        return res.status(404).json({ message: "Card not found" });
      }
      if (card.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
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
      
      // Verify wallet ownership
      const wallet = await storage.getWallet(validated.walletId);
      if (!wallet) {
        return res.status(404).json({ message: "Wallet not found" });
      }
      if (wallet.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      const automation = await storage.createAutomation(validated);
      res.json(automation);
    } catch (error: any) {
      console.error("Error creating automation:", error);
      res.status(400).json({ message: error.message || "Failed to create automation" });
    }
  });

  app.patch("/api/automations/:id/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      const { status } = req.body;

      if (!["active", "paused", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      // Verify ownership
      const existing = await storage.getAutomation(id);
      if (!existing) {
        return res.status(404).json({ message: "Automation not found" });
      }
      if (existing.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      const automation = await storage.updateAutomationStatus(id, status);
      res.json(automation);
    } catch (error) {
      console.error("Error updating automation status:", error);
      res.status(500).json({ message: "Failed to update automation status" });
    }
  });

  app.delete("/api/automations/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { id } = req.params;
      
      // Verify ownership
      const automation = await storage.getAutomation(id);
      if (!automation) {
        return res.status(404).json({ message: "Automation not found" });
      }
      if (automation.userId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      await storage.deleteAutomation(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting automation:", error);
      res.status(500).json({ message: "Failed to delete automation" });
    }
  });

  // AI Chat route
  app.post("/api/ai/chat", isAuthenticated, async (req: any, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Message is required" });
      }

      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is not configured");
        return res.status(503).json({ message: "AI service is not available" });
      }

      const OpenAI = (await import("openai")).default;
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a helpful financial advisor assistant for GIW (Global International Wallet), a USDC wallet application. Help users with financial advice, spending insights, and wallet management questions. Be concise and friendly.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 500,
      });

      const response = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      res.json({ response });
    } catch (error: any) {
      console.error("Error in AI chat:", error);
      
      // Don't leak implementation details
      const userMessage = error.status === 401 
        ? "AI service authentication failed" 
        : "Failed to process AI request. Please try again later.";
      
      res.status(500).json({ message: userMessage });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
