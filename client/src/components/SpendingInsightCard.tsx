import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SpendingInsightCardProps {
  title: string;
  amount: string;
  change: string;
  trend: "up" | "down";
  description: string;
}

export function SpendingInsightCard({ title, amount, change, trend, description }: SpendingInsightCardProps) {
  const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
  const isPositive = trend === "down";
  
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign className="h-5 w-5 text-primary" />
        </div>
        <Badge variant={isPositive ? "secondary" : "outline"} className="gap-1">
          <TrendIcon className="h-3 w-3" />
          <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
            {change}
          </span>
        </Badge>
      </div>
      
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <p className="text-3xl font-bold font-display tabular-nums mb-2">{amount}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Card>
  );
}
