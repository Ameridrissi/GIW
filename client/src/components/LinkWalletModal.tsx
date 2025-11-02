import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2 } from "lucide-react";

interface LinkWalletModalProps {
  open: boolean;
  onClose: () => void;
}

export function LinkWalletModal({ open, onClose }: LinkWalletModalProps) {
  const [walletAddress, setWalletAddress] = useState("");

  const handleLink = () => {
    console.log("Linking wallet:", walletAddress);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-link-wallet">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            Link Existing Wallet
          </DialogTitle>
          <DialogDescription>
            Connect your existing USDC wallet address
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="wallet-address">Wallet Address</Label>
            <Input
              id="wallet-address"
              placeholder="0x..."
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              className="mt-2 font-mono"
              data-testid="input-wallet-address"
            />
          </div>
          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-sm text-muted-foreground">
              Enter your existing USDC wallet address to link it to your GIW account.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleLink} className="flex-1" data-testid="button-link-wallet">
            Link Wallet
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
