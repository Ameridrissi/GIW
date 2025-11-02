import { BalanceCard } from "@/components/BalanceCard";
import { TransactionList } from "@/components/TransactionList";
import { PaymentCard } from "@/components/PaymentCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { AIInsightAlert } from "@/components/AIInsightAlert";
import { WalletCreationModal } from "@/components/WalletCreationModal";
import { LinkWalletModal } from "@/components/LinkWalletModal";
import { CreditCard, Users, Repeat, Wallet, Link2, ArrowDownToLine, ArrowUpFromLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function WalletPage() {
  const [showCreateWallet, setShowCreateWallet] = useState(false);
  const [showLinkWallet, setShowLinkWallet] = useState(false);
  const [transactions] = useState([
    {
      id: "1",
      type: "sent" as const,
      merchant: "Amazon Store",
      category: "shopping",
      amount: "124.50 USDC",
      date: "Today, 2:30 PM",
      status: "completed" as const,
    },
    {
      id: "2",
      type: "received" as const,
      merchant: "Salary Payment",
      category: "bills",
      amount: "3,000.00 USDC",
      date: "Yesterday, 9:00 AM",
      status: "completed" as const,
    },
    {
      id: "3",
      type: "sent" as const,
      merchant: "Starbucks",
      category: "food",
      amount: "8.50 USDC",
      date: "Nov 1, 4:15 PM",
      status: "pending" as const,
    },
    {
      id: "4",
      type: "sent" as const,
      merchant: "Uber",
      category: "travel",
      amount: "22.80 USDC",
      date: "Oct 31, 8:45 PM",
      status: "completed" as const,
    },
  ]);

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display mb-2">Wallet</h1>
        <p className="text-muted-foreground">Manage your USDC balance and payment cards</p>
      </div>

      <AIInsightAlert
        message="Based on your spending pattern, you could save $120 this month by using USDC for international payments instead of traditional cards."
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
        balance="2,450.00 USDC"
        usdValue="2,450.00"
        percentChange="+2.4%"
        isPositive={true}
      />

      <WalletCreationModal open={showCreateWallet} onClose={() => setShowCreateWallet(false)} />
      <LinkWalletModal open={showLinkWallet} onClose={() => setShowLinkWallet(false)} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TransactionList transactions={transactions} />
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Payment Cards</h2>
            <div className="space-y-4">
              <PaymentCard
                type="visa"
                last4="4242"
                expiry="12/25"
                isDefault={true}
                cardholderName="John Doe"
              />
              <PaymentCard
                type="mastercard"
                last4="5555"
                expiry="08/26"
                cardholderName="John Doe"
              />
            </div>
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
    </div>
  );
}
