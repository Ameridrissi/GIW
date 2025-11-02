import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Wallet } from "@shared/schema";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export function WithdrawModal({ open, onClose, wallet }: WithdrawModalProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Reset form when modal opens or wallet changes to prevent stale values
  useEffect(() => {
    if (!open || !wallet) {
      setRecipientAddress("");
      setAmount("");
      setIsSubmitting(false);
    }
  }, [open, wallet]);

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

    setIsSubmitting(true);
    
    toast({
      title: "Coming Soon",
      description: "Withdraw functionality will be available soon with Circle transaction signing",
    });
    
    setIsSubmitting(false);
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-withdraw">
        <DialogHeader>
          <DialogTitle>Withdraw USDC</DialogTitle>
          <DialogDescription>
            Send USDC from your {wallet.name} wallet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">Available Balance</p>
            <p className="text-2xl font-bold">${parseFloat(wallet.balance || "0").toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">USDC</p>
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
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              data-testid="input-amount"
            />
          </div>

          {wallet.requiresPinSetup && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ Complete PIN setup before withdrawing funds
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> Transactions require PIN confirmation via Circle's secure authentication.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-cancel-withdraw">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || wallet.requiresPinSetup}
              className="flex-1"
              data-testid="button-submit-withdraw"
            >
              {isSubmitting ? "Processing..." : "Withdraw"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
