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
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { executeCircleChallenge, setCircleLayout } from "@/lib/circleSDK";
import type { Wallet as WalletType } from "@shared/schema";

interface WalletCreationModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletCreationModal({ open, onClose }: WalletCreationModalProps) {
  const [step, setStep] = useState<"create" | "success">("create");
  const [walletName, setWalletName] = useState("");
  const [createdWallet, setCreatedWallet] = useState<WalletType | null>(null);
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/wallets", { name });
      return response.json();
    },
    onSuccess: async (data: any) => {
      let finalWallet = data.wallet;

      // Check if PIN setup is required (Circle integration)
      if (data.requiresPinSetup && data.challengeId) {
        try {
          // Configure Circle SDK layout
          setCircleLayout({
            title: 'Secure Your Wallet',
            subtitle: 'Create a PIN to protect your wallet',
            showCloseButton: false,
          });

          // Execute Circle challenge for PIN setup
          await executeCircleChallenge(
            data.challengeId,
            data.userToken,
            data.encryptionKey
          );

          // PIN setup successful - now complete the setup
          const completeResponse = await apiRequest("PATCH", `/api/wallets/${data.wallet.id}/complete-setup`, {});
          const completedWallet = await completeResponse.json();
          
          // Sync balance from Circle
          const syncResponse = await apiRequest("POST", `/api/wallets/${data.wallet.id}/sync-balance`, {});
          const syncedWallet = await syncResponse.json();
          
          finalWallet = syncedWallet;

          toast({
            title: "Success",
            description: "Wallet created and secured with PIN",
          });
        } catch (error) {
          console.error('Circle PIN setup error:', error);
          toast({
            title: "Warning",
            description: "Wallet created but PIN setup incomplete. You can set it up later.",
            variant: "destructive",
          });
        }
      }

      // Show success screen
      setCreatedWallet(finalWallet);
      setStep("success");
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreate = () => {
    if (!walletName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a wallet name",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate(walletName);
  };

  const handleClose = () => {
    setStep("create");
    setWalletName("");
    setCreatedWallet(null);
    onClose();
  };

  const copyAddress = () => {
    if (createdWallet?.address) {
      navigator.clipboard.writeText(createdWallet.address);
      toast({
        title: "Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={createMutation.isPending}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex-1" 
                data-testid="button-create-wallet"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "Creating..." : "Create Wallet"}
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
                    value={createdWallet?.address || ""}
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
            <Button onClick={handleClose} className="w-full" data-testid="button-done">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
