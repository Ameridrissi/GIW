import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, Send, ArrowDownToLine } from "lucide-react";
import HomePage from "@/pages/HomePage";
import WalletPage from "@/pages/WalletPage";
import InsightsPage from "@/pages/InsightsPage";
import CardsPage from "@/pages/CardsPage";
import SettingsPage from "@/pages/SettingsPage";
import AuthPage from "@/pages/AuthPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/cards" component={CardsPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <div className="flex h-screen w-full">
            <AppSidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <header className="border-b bg-background">
                {/* Animated Banner */}
                <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
                  <div className="animate-slide-banner whitespace-nowrap py-4 px-4">
                    <span className="inline-block text-white text-lg font-semibold">
                      🎉 Welcome to GIW - Pay Anywhere, Everywhere! • 0% Fees on International Transfers • AI-Powered Wealth Management • Instant USDC Deposits & Withdrawals • Secure Blockchain Transactions • 24/7 Global Support • 
                    </span>
                    <span className="inline-block text-white text-lg font-semibold">
                      🎉 Welcome to GIW - Pay Anywhere, Everywhere! • 0% Fees on International Transfers • AI-Powered Wealth Management • Instant USDC Deposits & Withdrawals • Secure Blockchain Transactions • 24/7 Global Support • 
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 p-4">
                  <SidebarTrigger data-testid="button-sidebar-toggle" />
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1 overflow-auto p-8">
                <div className="max-w-7xl mx-auto">
                  <Router />
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
