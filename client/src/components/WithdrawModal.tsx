import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Wallet } from "@shared/schema";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export function WithdrawModal({ open, onClose, wallet }: WithdrawModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();

  // Reset form when modal opens or wallet changes to prevent stale values
  useEffect(() => {
    if (!open || !wallet) {
      setRecipientAddress("");
      setAmount("");
    }
  }, [open, wallet]);

  const transferMutation = useMutation({
    mutationFn: async (data: { walletId: string; recipientAddress: string; amount: string }) => {
      return apiRequest("/api/transfers", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
    },
    onSuccess: (data: any) => {
      toast({
        title: "Transfer Initiated",
        description: data.message || "Your USDC transfer has been initiated successfully.",
      });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      if (wallet) {
        queryClient.invalidateQueries({ queryKey: ["/api/wallets", wallet.id, "transactions"] });
      }
      
      // Reset form and close modal
      setRecipientAddress("");
      setAmount("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Transfer Failed",
        description: error.message || "Failed to initiate transfer. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async () => {
    if (!wallet) return;
    
    if (!recipientAddress || !amount) {
      toast({
        title: "Missing Information",
        description: "Please enter both recipient address and amount",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    const walletBalance = parseFloat(wallet.balance || "0");
    if (amountNum > walletBalance) {
      toast({
        title: "Insufficient Balance",
        description: `Your wallet balance is ${walletBalance} USDC`,
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      walletId: wallet.id,
      recipientAddress,
      amount,
    });
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-withdraw">
        <DialogHeader>
          <DialogTitle>Send USDC</DialogTitle>
          <DialogDescription>
            Transfer USDC from your {wallet.name} wallet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">{parseFloat(wallet.balance || "0").toFixed(2)} USDC</p>
            <p className="text-xs text-muted-foreground">${parseFloat(wallet.balance || "0").toFixed(2)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              data-testid="input-recipient-address"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (USDC)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-amount"
            />
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> Circle transfers require PIN confirmation to complete on the blockchain.
            </p>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1" 
              data-testid="button-cancel-withdraw"
              disabled={transferMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={transferMutation.isPending}
              className="flex-1"
              data-testid="button-submit-withdraw"
            >
              {transferMutation.isPending ? "Processing..." : "Send"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
