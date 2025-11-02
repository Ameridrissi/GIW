import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, ArrowDownLeft, ShoppingBag, Coffee, Plane, Home } from "lucide-react";

interface Transaction {
  id: string;
  type: "sent" | "received";
  merchant: string;
  category: string;
  amount: string;
  date: string;
  status: "completed" | "pending";
}

interface TransactionListProps {
  transactions: Transaction[];
}

const categoryIcons: Record<string, any> = {
  shopping: ShoppingBag,
  food: Coffee,
  travel: Plane,
  bills: Home,
};

export function TransactionList({ transactions }: TransactionListProps) {
  return (
    <Card className="p-6">
      <h3 className="text-xl font-semibold mb-6">Recent Transactions</h3>
      <div className="space-y-4">
        {transactions.map((tx) => {
          const Icon = categoryIcons[tx.category] || ShoppingBag;
          return (
            <div
              key={tx.id}
              className="flex items-center gap-4 py-4 border-b last:border-b-0"
              data-testid={`transaction-${tx.id}`}
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate" data-testid={`text-merchant-${tx.id}`}>
                  {tx.merchant}
                </p>
                <p className="text-sm text-muted-foreground">{tx.date}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className={`font-semibold tabular-nums ${tx.type === 'received' ? 'text-green-600 dark:text-green-400' : 'text-foreground'}`}>
                  {tx.type === 'received' ? '+' : '-'}{tx.amount}
                </p>
                <Badge variant={tx.status === 'completed' ? 'secondary' : 'outline'} className="mt-1">
                  {tx.status}
                </Badge>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
