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
import { Wallet, Copy, CheckCircle2, Lock, AlertCircle } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { setAuthentication, executeChallenge } from "@/lib/circleSDK";
import type { Wallet as WalletType } from "@shared/schema";

interface WalletCreationModalProps {
  open: boolean;
  onClose: () => void;
}

export function WalletCreationModal({ open, onClose }: WalletCreationModalProps) {
  const [step, setStep] = useState<"create" | "setup-pin" | "create-wallet" | "success">("create");
  const [walletName, setWalletName] = useState("");
  const [createdWallet, setCreatedWallet] = useState<WalletType | null>(null);
  const [isPinSetup, setIsPinSetup] = useState(false);
  const { toast } = useToast();

  // Step 1: Initiate PIN setup
  const setupPinMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/initiate-pin", {});
      return response.json();
    },
    onSuccess: async (data: any) => {
      console.log('[PIN Setup] Challenge received:', data.challengeId);
      
      // Set authentication (matching working example)
      setAuthentication(data.userToken, data.encryptionKey);
      
      // Execute PIN setup challenge with callback (matching working example)
      executeChallenge(data.challengeId, (error: any, result: any) => {
        if (error) {
          console.error('[PIN Setup] Failed:', error);
          toast({
            title: "PIN Setup Failed",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
          setStep("create");
          return;
        }
        
        if (result) {
          console.log('[PIN Setup] Success:', result);
          setIsPinSetup(true);
          toast({
            title: "PIN Set Successfully",
            description: "Your PIN has been created. Creating wallet...",
          });
          // Automatically proceed to create wallet
          setStep("create-wallet");
          createWalletMutation.mutate(walletName);
        }
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initiate PIN setup. Please try again.",
        variant: "destructive",
      });
      setStep("create");
    },
  });

  // Step 2: Create wallet (after PIN is set)
  const createWalletMutation = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiRequest("POST", "/api/wallets", { name });
      return response.json();
    },
    onSuccess: async (data: any) => {
      console.log('[Wallet Creation] Challenge received:', data.challengeId);
      
      // Authentication is already set from PIN setup
      // Execute wallet creation challenge with callback (matching working example)
      executeChallenge(data.challengeId, (error: any, result: any) => {
        if (error) {
          console.error('[Wallet Creation] Failed:', error);
          toast({
            title: "Wallet Creation Failed",
            description: error.message || "Please try again.",
            variant: "destructive",
          });
          setStep("create");
          return;
        }
        
        if (result) {
          console.log('[Wallet Creation] Success:', result);
          toast({
            title: "Wallet Created",
            description: "Your blockchain wallet has been created successfully!",
          });
          
          setCreatedWallet(data.wallet);
          setStep("success");
          queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
        }
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
      setStep("create");
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
    
    // Start the 2-step flow: PIN setup first
    setStep("setup-pin");
    setupPinMutation.mutate();
  };

  const handleClose = () => {
    setStep("create");
    setWalletName("");
    setCreatedWallet(null);
    setIsPinSetup(false);
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
        {step === "create" && (
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
              <Button variant="outline" onClick={handleClose} className="flex-1" disabled={setupPinMutation.isPending}>
                Cancel
              </Button>
              <Button 
                onClick={handleCreate} 
                className="flex-1" 
                data-testid="button-create-wallet"
                disabled={setupPinMutation.isPending}
              >
                {setupPinMutation.isPending ? "Creating..." : "Create Wallet"}
              </Button>
            </div>
          </>
        )}

        {step === "setup-pin" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Setting Up Security PIN
              </DialogTitle>
              <DialogDescription>
                Creating your 6-digit security PIN to protect your wallet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Please complete the PIN setup in the Circle security modal...
              </p>
            </div>
          </>
        )}

        {step === "create-wallet" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Creating Wallet
              </DialogTitle>
              <DialogDescription>
                Generating your blockchain wallet on Arc Testnet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-8">
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Please confirm the wallet creation in the Circle security modal...
              </p>
            </div>
          </>
        )}

        {step === "success" && (
          <>
            <DialogHeader>
              <div className="mx-auto h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500" />
              </div>
              <DialogTitle className="text-center">Wallet Created Successfully!</DialogTitle>
              <DialogDescription className="text-center">
                Your blockchain wallet is ready on {createdWallet?.blockchain || 'ARC-TESTNET'} testnet
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label>Wallet Address</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={createdWallet?.address || "Pending blockchain confirmation..."}
                    readOnly
                    className="font-mono text-sm"
                    data-testid="text-wallet-address"
                  />
                  <Button variant="outline" size="icon" onClick={copyAddress} data-testid="button-copy-address" disabled={!createdWallet?.address}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {createdWallet?.requiresPinSetup && (
                <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <div className="flex gap-2 items-start">
                    <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        PIN Setup Required
                      </p>
                      <p className="text-xs text-orange-600/80 dark:text-orange-400/80">
                        To secure your wallet and enable transactions, you'll need to set up a 6-digit PIN. Visit your dashboard to complete this setup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <p className="text-sm text-muted-foreground">
                  Your wallet is a real blockchain wallet powered by Circle. Save the address above to receive USDC.
                </p>
              </div>
            </div>
            <Button onClick={handleClose} className="w-full" data-testid="button-done">
              Go to Dashboard
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
