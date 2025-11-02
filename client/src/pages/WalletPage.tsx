import { BalanceCard } from "@/components/BalanceCard";
import { TransactionList } from "@/components/TransactionList";
import { PaymentCard } from "@/components/PaymentCard";
import { QuickActionCard } from "@/components/QuickActionCard";
import { AIInsightAlert } from "@/components/AIInsightAlert";
import { CreditCard, Users, Repeat } from "lucide-react";
import { useState } from "react";

export default function WalletPage() {
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
    },
    {
      title: "Split Bill",
      description: "Divide expenses with friends",
      icon: Users,
    },
    {
      title: "Recurring Payment",
      description: "Set up automatic payments",
      icon: Repeat,
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

      <BalanceCard
        balance="2,450.00 USDC"
        usdValue="2,450.00"
        percentChange="+2.4%"
        isPositive={true}
      />

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
