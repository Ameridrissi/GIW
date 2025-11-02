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
import { Wallet, Copy, CheckCircle2 } from "lucide-react";

interface WalletCreationModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletCreationModal({ open, onClose }: WalletCreationModalProps) {
  const [step, setStep] = useState<"create" | "success">("create");
  const [walletName, setWalletName] = useState("");
  const [generatedAddress] = useState("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");

  const handleCreate = () => {
    console.log("Creating wallet:", walletName);
    setStep("success");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(generatedAddress);
    console.log("Address copied");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-wallet-creation">
        {step === "create" ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Create USDC Wallet
              </DialogTitle>
              <DialogDescription>
                Create a new wallet to store and manage your USDC
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="wallet-name">Wallet Name</Label>
                <Input
                  id="wallet-name"
                  placeholder="My Main Wallet"
                  value={walletName}
                  onChange={(e) => setWalletName(e.target.value)}
                  className="mt-2"
                  data-testid="input-wallet-name"
                />
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Your wallet will be secured with Circle's authentication and can be accessed from anywhere.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreate} className="flex-1" data-testid="button-create-wallet">
                Create Wallet
              </Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-center">Wallet Created Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your new USDC wallet is ready to use
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Wallet Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={generatedAddress}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="text-wallet-address"
                  />
                  <Button variant="outline" size="icon" onClick={copyAddress} data-testid="button-copy-address">
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Save this address to receive USDC from anyone, anywhere in the world.
                </p>
              </div>
            </div>
            <Button onClick={onClose} className="w-full" data-testid="button-done">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
