import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import type { Wallet } from "@shared/schema";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  wallet: Wallet | null;
}

export function DepositModal({ open, onClose, wallet }: DepositModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!wallet?.address) return;
    
    try {
      await navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy address to clipboard",
        variant: "destructive",
      });
    }
  };

  if (!wallet) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-deposit">
        <DialogHeader>
          <DialogTitle>Deposit USDC</DialogTitle>
          <DialogDescription>
            Send USDC to this address to fund your {wallet.name} wallet
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Wallet Address</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-sm font-mono break-all" data-testid="text-wallet-address">
                {wallet.address}
              </code>
              <Button
                size="icon"
                variant="ghost"
                onClick={handleCopy}
                data-testid="button-copy-address"
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="p-4 border rounded-lg space-y-2">
            <p className="text-sm font-semibold">Network Information</p>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Blockchain:</span>
                <span className="font-mono">{wallet.blockchain || 'MATIC-AMOY'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Token:</span>
                <span>USDC</span>
              </div>
            </div>
          </div>

          {wallet.requiresPinSetup && (
            <div className="p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <p className="text-sm text-orange-600 dark:text-orange-400">
                ⚠️ Complete PIN setup before depositing funds
              </p>
            </div>
          )}

          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <p className="text-xs text-blue-600 dark:text-blue-400">
              <strong>Note:</strong> Only send USDC on {wallet.blockchain || 'MATIC-AMOY'} network. Sending other tokens or using wrong network may result in permanent loss of funds.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1" data-testid="button-close-deposit">
              Close
            </Button>
            <Button onClick={handleCopy} className="flex-1" data-testid="button-copy-address-main">
              <Copy className="h-4 w-4 mr-2" />
              Copy Address
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
