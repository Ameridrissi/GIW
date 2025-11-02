import { BalanceCard } from "@/components/BalanceCard";
import { TransactionList } from "@/components/TransactionList";
import { PaymentCard } from "@/components/PaymentCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { AIInsightAlert } from "@/components/AIInsightAlert";
import { WalletCreationModal } from "@/components/WalletCreationModal";
import { LinkWalletModal } from "@/components/LinkWalletModal";
import { CreditCard, Users, Repeat, Wallet, Link2, ArrowDownToLine, ArrowUpFromLine, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Wallet as WalletType, Transaction, PaymentCard as CardType } from "@shared/schema";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

export default function WalletPage() {
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showLinkWallet, setShowLinkWallet] = useState(false);
  const { toast } = useToast();

  const { data: wallets, isLoading: walletsLoading, isError: walletsError } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const syncBalanceMutation = useMutation({
    mutationFn: async (walletId: string) => {
      console.log('[Balance Sync] Calling API for wallet:', walletId);
      return await apiRequest("POST", `/api/wallets/${walletId}/sync-balance`);
    },
    onSuccess: (data: any) => {
      console.log('[Balance Sync] Response:', data);
      // Check if wallet requires PIN setup
      if (data.requiresPinSetup) {
        console.log('[Balance Sync] Showing PIN setup toast');
        toast({
          title: "PIN Setup Required",
          description: data.message || "Please complete PIN setup via Circle Console before syncing balance",
          variant: "default",
        });
      } else {
        console.log('[Balance Sync] Showing success toast and invalidating cache');
        queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
        toast({
          title: "Balance Synced",
          description: "Your wallet balance has been updated from the blockchain",
        });
      }
    },
    onError: () => {
      toast({
        title: "Sync Failed",
        description: "Failed to sync balance from blockchain. Please try again.",
        variant: "destructive",
      });
    },
  });

  const { data: cards, isLoading: cardsLoading, isError: cardsError } = useQuery<CardType[]>({
    queryKey: ["/api/cards"],
  });

  const primaryWallet = wallets?.[0];

  const { data: transactions, isLoading: transactionsLoading, isError: transactionsError } = useQuery<Transaction[]>({
    queryKey: [`/api/wallets/${primaryWallet?.id}/transactions`],
    enabled: !!primaryWallet?.id,
  });

  const formatTransactionForDisplay = (tx: Transaction) => {
    return {
      id: tx.id,
      type: tx.type,
      merchant: tx.recipient || tx.description || "Unknown",
      category: tx.category || "other",
      amount: `${tx.amount} USDC`,
      date: format(new Date(tx.createdAt), "MMM d, h:mm a"),
      status: tx.status,
    };
  };

  const quickActions = [
    {
      title: "Add Card",
      description: "Link a new payment card to your wallet",
      icon: CreditCard,
      onClick: () => console.log("Add card clicked"),
    },
    {
      title: "Split Bill",
      description: "Divide expenses with friends",
      icon: Users,
      onClick: () => console.log("Split bill clicked"),
    },
    {
      title: "Automate Payments",
      description: "Set up recurring and scheduled payments",
      icon: Repeat,
      onClick: () => console.log("Automate payments clicked"),
    },
  ];

  if (walletsLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your USDC balance and payment cards</p>
        </div>
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (walletsError) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Wallet</h1>
          <p className="text-muted-foreground">Manage your USDC balance and payment cards</p>
        </div>
        <Card className="p-8 text-center">
          <div className="text-destructive text-lg font-semibold mb-2">Failed to load wallets</div>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </Card>
      </div>
    );
  }

  const totalBalance = wallets?.reduce((sum, wallet) => sum + parseFloat(wallet.balance || "0"), 0) || 0;
  const formattedBalance = totalBalance.toFixed(2);
  const displayTransactions = transactions?.map(formatTransactionForDisplay) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your USDC balance and payment cards</p>
      </div>

      {!wallets || wallets.length === 0 ? (
        <Card className="p-8 text-center">
          <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No Wallets Yet</h3>
          <p className="text-muted-foreground mb-4">Create or link your first wallet to get started</p>
          <div className="flex gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => setShowLinkWallet(true)}
              data-testid="button-link-wallet"
            >
              <Link2 className="h-5 w-5 mr-2" />
              Link Wallet
            </Button>
            <Button
              onClick={() => setShowCreateWallet(true)}
              data-testid="button-create-wallet"
            >
              <Wallet className="h-5 w-5 mr-2" />
              Create Wallet
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {primaryWallet?.requiresPinSetup && (
            <Alert variant="default" className="mb-6 border-blue-500 bg-blue-50 dark:bg-blue-950/20">
              <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <AlertTitle className="text-blue-900 dark:text-blue-100 font-semibold">Complete PIN Setup Required</AlertTitle>
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Your wallet is created on the blockchain, but you need to complete PIN setup via Circle Console before you can sync your balance or make transactions.
                <a 
                  href="https://console.circle.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="ml-2 underline font-medium hover:text-blue-600 dark:hover:text-blue-300"
                >
                  Open Circle Console →
                </a>
              </AlertDescription>
            </Alert>
          )}

          <AIInsightAlert
            message="Based on your spending pattern, you could save money by using USDC for international payments instead of traditional cards."
            type="tip"
          />

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-semibold">Your Wallets</h2>
                <p className="text-sm text-muted-foreground">Manage your USDC wallets and payment methods</p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowLinkWallet(true)}
                  data-testid="button-link-wallet"
                >
                  <Link2 className="h-5 w-5 mr-2" />
                  Link Wallet
                </Button>
                <Button
                  onClick={() => setShowCreateWallet(true)}
                  data-testid="button-create-wallet"
                >
                  <Wallet className="h-5 w-5 mr-2" />
                  Create Wallet
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2"
                data-testid="button-deposit"
                onClick={() => console.log("Deposit clicked")}
              >
                <ArrowDownToLine className="h-6 w-6 text-green-500" />
                <div>
                  <div className="font-semibold">Deposit</div>
                  <div className="text-xs text-muted-foreground">Add USDC to wallet</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2"
                data-testid="button-withdraw"
                onClick={() => console.log("Withdraw clicked")}
              >
                <ArrowUpFromLine className="h-6 w-6 text-blue-500" />
                <div>
                  <div className="font-semibold">Withdraw</div>
                  <div className="text-xs text-muted-foreground">Send to bank account</div>
                </div>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="h-auto py-4 flex-col gap-2"
                data-testid="button-automation"
                onClick={() => console.log("Automation clicked")}
              >
                <Repeat className="h-6 w-6 text-purple-500" />
                <div>
                  <div className="font-semibold">Automation</div>
                  <div className="text-xs text-muted-foreground">Schedule payments</div>
                </div>
              </Button>
            </div>
          </Card>

          <BalanceCard
            balance={`${formattedBalance} USDC`}
            usdValue={formattedBalance}
            percentChange="+0.0%"
            isPositive={true}
            onRefresh={primaryWallet ? () => syncBalanceMutation.mutate(primaryWallet.id) : undefined}
            isRefreshing={syncBalanceMutation.isPending}
            requiresPinSetup={primaryWallet?.requiresPinSetup || false}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {transactionsLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : transactionsError ? (
                <Card className="p-8 text-center">
                  <div className="text-destructive text-lg font-semibold mb-2">Failed to load transactions</div>
                  <p className="text-muted-foreground">Please try refreshing the page</p>
                </Card>
              ) : (
                <TransactionList transactions={displayTransactions} />
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold mb-4">Payment Cards</h2>
                {cardsLoading ? (
                  <Skeleton className="h-48 w-full" />
                ) : cardsError ? (
                  <Card className="p-6 text-center">
                    <div className="text-destructive font-semibold mb-2">Failed to load cards</div>
                    <p className="text-sm text-muted-foreground">Please try refreshing the page</p>
                  </Card>
                ) : cards && cards.length > 0 ? (
                  <div className="space-y-4">
                    {cards.map((card) => (
                      <PaymentCard
                        key={card.id}
                        type={card.cardType === "Visa" ? "visa" : "mastercard"}
                        last4={card.lastFour}
                        expiry={card.expiryDate}
                        isDefault={card.isDefault}
                        cardholderName={card.cardholderName}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="p-6 text-center">
                    <CreditCard className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">No payment cards linked</p>
                  </Card>
                )}
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {quickActions.map((action) => (
                <QuickActionCard key={action.title} {...action} />
              ))}
            </div>
          </div>
        </>
      )}

      <WalletCreationModal open={showCreateWallet} onClose={() => setShowCreateWallet(false)} />
      <LinkWalletModal open={showLinkWallet} onClose={() => setShowLinkWallet(false)} />
    </div>
  );
}
