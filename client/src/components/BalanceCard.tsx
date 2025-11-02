import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface BalanceCardProps {
  balance: string;
  usdValue: string;
  percentChange: string;
  isPositive: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  requiresPinSetup?: boolean;
}

export function BalanceCard({ balance, usdValue, percentChange, isPositive, onRefresh, isRefreshing, requiresPinSetup }: BalanceCardProps) {
  return (
    <Card className="p-8">
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <p className="text-sm uppercase tracking-wide text-muted-foreground font-medium">
              Total Balance
            </p>
            <Badge variant="secondary" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                {percentChange}
              </span>
            </Badge>
          </div>
          <h2 className="text-6xl font-bold font-display tabular-nums" data-testid="text-balance">
            {balance}
          </h2>
          <p className="text-xl text-muted-foreground mt-2 tabular-nums">
            ≈ ${usdValue}
          </p>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" data-testid="button-send">
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Send
          </Button>
          <Button variant="secondary" className="flex-1" data-testid="button-receive">
            <ArrowDownLeft className="h-5 w-5 mr-2" />
            Receive
          </Button>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={onRefresh}
                disabled={!onRefresh || isRefreshing}
                data-testid="button-refresh"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRefreshing ? 'Syncing balance...' : 'Sync balance from blockchain'}</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
}
