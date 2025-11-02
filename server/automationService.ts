import { storage } from "./storage";
import { circleService } from "./circleService";
import type { Automation } from "../shared/schema";

interface AutomationExecutionResult {
  automationId: string;
  success: boolean;
  error?: string;
  transactionId?: string;
}

export class AutomationService {
  /**
   * Get the next run date based on frequency
   */
  private calculateNextRunDate(frequency: string | null, currentDate: Date): Date {
    const next = new Date(currentDate);
    
    switch (frequency) {
      case "daily":
        next.setDate(next.getDate() + 1);
        break;
      case "weekly":
        next.setDate(next.getDate() + 7);
        break;
      case "biweekly":
        next.setDate(next.getDate() + 14);
        break;
      case "monthly":
        next.setMonth(next.getMonth() + 1);
        break;
      default:
        // For one-time/scheduled automations, mark as completed
        return next;
    }
    
    return next;
  }

  /**
   * Execute a single automation
   */
  private async executeAutomation(automation: Automation): Promise<AutomationExecutionResult> {
    console.log(`[Automation] Executing automation: ${automation.id} - ${automation.name}`);
    
    try {
      // Get the wallet
      const wallet = await storage.getWallet(automation.walletId);
      if (!wallet) {
        throw new Error("Wallet not found");
      }

      // Check if wallet has sufficient balance
      const balance = parseFloat(wallet.balance);
      const amount = parseFloat(automation.amount);
      if (balance < amount) {
        throw new Error(`Insufficient balance. Required: ${amount}, Available: ${balance}`);
      }

      // For savings automations, just update the balance (internal transfer)
      if (automation.type === "savings") {
        console.log(`[Automation] Executing savings goal: ${automation.name}`);
        // In a real implementation, this would create a separate savings wallet or track savings separately
        // For now, we'll just log it and create a transaction record
        await storage.createTransaction({
          walletId: automation.walletId,
          type: "sent",
          merchant: "Savings Goal",
          category: "Savings",
          amount: automation.amount,
          status: "completed",
        });
        
        return {
          automationId: automation.id,
          success: true,
        };
      }

      // For recurring and scheduled payments, execute Circle transfer
      if (!automation.recipient) {
        throw new Error("No recipient address specified");
      }

      if (!wallet.circleWalletId) {
        throw new Error("Wallet not linked to Circle - cannot execute transfer");
      }

      // Get user and Circle token
      const user = await storage.getUser(automation.userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Create a fresh Circle user token
      const circleUserToken = await circleService.createUser(automation.userId);
      
      // Initiate Circle transfer (this creates a challenge that requires PIN)
      // Note: Arc Testnet USDC token ID - in production, fetch from Circle API
      const usdcTokenId = "36b1737e-c2ed-5915-a218-8e3bf9a2c8f1"; // Arc Testnet USDC
      
      console.log(`[Automation] Initiating Circle transfer: ${amount} USDC to ${automation.recipient}`);
      
      try {
        const challengeId = await circleService.createTransfer(
          circleUserToken,
          wallet.circleWalletId,
          automation.recipient,
          usdcTokenId,
          automation.amount
        );
        
        console.log(`[Automation] Circle transfer initiated, challengeId: ${challengeId}`);
        console.log(`[Automation] Transfer requires PIN confirmation to complete on blockchain`);
        
        // Create transaction record with challenge reference
        const transaction = await storage.createTransaction({
          walletId: automation.walletId,
          type: "sent",
          merchant: automation.recipient,
          category: automation.type === "recurring" ? "Recurring Payment" : "Scheduled Transfer",
          amount: automation.amount,
          status: "pending",
        });

        // Update wallet balance to reflect the pending transfer
        const newBalance = (balance - amount).toFixed(6);
        await storage.updateWalletBalance(automation.walletId, newBalance);

        console.log(`[Automation] Transaction created: ${transaction.id}`);
        console.log(`[Automation] Challenge ${challengeId} awaiting PIN confirmation`);
        
        return {
          automationId: automation.id,
          success: true,
          transactionId: transaction.id,
        };
      } catch (transferError: any) {
        console.error(`[Automation] Circle transfer failed:`, transferError.message);
        throw new Error(`Circle transfer failed: ${transferError.message}`);
      }
    } catch (error: any) {
      console.error(`[Automation] Error executing automation ${automation.id}:`, error.message);
      return {
        automationId: automation.id,
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process all due automations
   */
  async processDueAutomations(): Promise<AutomationExecutionResult[]> {
    console.log("[Automation] Checking for due automations...");
    
    try {
      // Get all active automations
      const automations = await storage.getAllActiveAutomations();
      console.log(`[Automation] Found ${automations.length} active automations`);
      
      const now = new Date();
      const results: AutomationExecutionResult[] = [];
      
      for (const automation of automations) {
        // Check if automation is due to run
        if (!automation.nextRunDate) {
          console.log(`[Automation] Skipping ${automation.id} - no next run date`);
          continue;
        }
        
        const nextRun = new Date(automation.nextRunDate);
        if (nextRun > now) {
          // Not yet due
          continue;
        }
        
        console.log(`[Automation] Automation ${automation.id} is due to run`);
        
        // Execute the automation
        const result = await this.executeAutomation(automation);
        results.push(result);
        
        // Update automation based on result
        if (result.success) {
          // Calculate next run date
          if (automation.type === "scheduled") {
            // One-time scheduled transfer - mark as completed
            await storage.updateAutomationStatus(automation.id, "completed");
            console.log(`[Automation] Completed scheduled automation: ${automation.id}`);
          } else {
            // Recurring or savings - update next run date
            const nextRunDate = this.calculateNextRunDate(automation.frequency, now);
            await storage.updateAutomationNextRun(automation.id, nextRunDate);
            console.log(`[Automation] Updated next run date for ${automation.id}: ${nextRunDate.toISOString()}`);
          }
        } else {
          // Execution failed - pause the automation
          console.error(`[Automation] Pausing automation ${automation.id} due to error: ${result.error}`);
          await storage.updateAutomationStatus(automation.id, "paused");
        }
      }
      
      if (results.length > 0) {
        console.log(`[Automation] Processed ${results.length} automations`);
      }
      
      return results;
    } catch (error) {
      console.error("[Automation] Error processing due automations:", error);
      return [];
    }
  }
}

export const automationService = new AutomationService();
