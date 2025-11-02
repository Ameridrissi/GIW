import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, TrendingUp, Activity, Plus, ArrowDownToLine, ArrowUpFromLine, CreditCard, Repeat } from "lucide-react";
import { useState } from "react";
import { WalletCreationModal } from "@/components/WalletCreationModal";
import { Skeleton } from "@/components/ui/skeleton";
import type { Wallet as WalletType, Transaction } from "@shared/schema";

export default function DashboardPage() {
  const [showCreateWallet, setShowCreateWallet] = useState(false);

  const { data: wallets = [], isLoading: walletsLoading } = useQuery<WalletType[]>({
    queryKey: ["/api/wallets"],
  });

  const { data: user } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Calculate total balance across all wallets
  const totalBalance = wallets.reduce((sum, wallet) => sum + parseFloat(wallet.balance || "0"), 0);

  // Get recent transactions from all wallets
  const allTransactions: Transaction[] = [];
  const recentTransactions = allTransactions.slice(0, 5);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display" data-testid="text-dashboard-title">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back{user?.firstName ? `, ${user.firstName}` : ''}
          </p>
        </div>
        <Button onClick={() => setShowCreateWallet(true)} data-testid="button-create-wallet">
          <Plus className="h-4 w-4 mr-2" />
          Create Wallet
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-total-balance">
                  ${totalBalance.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  USDC across {wallets.length} {wallets.length === 1 ? 'wallet' : 'wallets'}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Wallets</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {walletsLoading ? (
              <Skeleton className="h-8 w-12" />
            ) : (
              <>
                <div className="text-2xl font-bold" data-testid="text-wallet-count">
                  {wallets.length}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {wallets.filter(w => !w.requiresPinSetup).length} fully set up
                </p>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allTransactions.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            <Button size="sm" variant="outline" className="flex-1" data-testid="button-deposit">
              <ArrowDownToLine className="h-3 w-3" />
            </Button>
            <Button size="sm" variant="outline" className="flex-1" data-testid="button-withdraw">
              <ArrowUpFromLine className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Wallets Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Wallets</CardTitle>
          <CardDescription>Manage your USDC wallets and view balances</CardDescription>
        </CardHeader>
        <CardContent>
          {walletsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <Skeleton className="h-12 w-48" />
                  <Skeleton className="h-8 w-24" />
                </div>
              ))}
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No wallets yet</h3>
              <p className="text-muted-foreground mb-4">Create your first USDC wallet to get started</p>
              <Button onClick={() => setShowCreateWallet(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Wallet
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                  data-testid={`card-wallet-${wallet.id}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Wallet className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold" data-testid={`text-wallet-name-${wallet.id}`}>
                        {wallet.name}
                      </h4>
                      <p className="text-sm text-muted-foreground font-mono">
                        {wallet.address.substring(0, 10)}...{wallet.address.substring(wallet.address.length - 8)}
                      </p>
                      {wallet.requiresPinSetup && (
                        <p className="text-xs text-orange-500 mt-1">⚠️ PIN setup incomplete</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold" data-testid={`text-wallet-balance-${wallet.id}`}>
                      ${parseFloat(wallet.balance || "0").toFixed(2)}
                    </div>
                    <p className="text-sm text-muted-foreground">USDC</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest transactions</CardDescription>
        </CardHeader>
        <CardContent>
          {recentTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No transactions yet
            </div>
          ) : (
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      tx.type === 'received' ? 'bg-green-500/10' : 'bg-red-500/10'
                    }`}>
                      {tx.type === 'received' ? (
                        <ArrowDownToLine className="h-5 w-5 text-green-500" />
                      ) : (
                        <ArrowUpFromLine className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{tx.merchant}</p>
                      <p className="text-sm text-muted-foreground">{tx.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.type === 'received' ? 'text-green-500' : 'text-red-500'}`}>
                      {tx.type === 'received' ? '+' : '-'}${parseFloat(tx.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">{tx.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <WalletCreationModal open={showCreateWallet} onClose={() => setShowCreateWallet(false)} />
    </div>
  );
}
