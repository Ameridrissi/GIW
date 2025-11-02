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
              <header className="flex items-center justify-between gap-4 p-4 border-b bg-background">
                <SidebarTrigger data-testid="button-sidebar-toggle" />
                
                <div className="flex items-center gap-4 flex-1 justify-center">
                  <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-card border">
                    <Wallet className="h-5 w-5 text-primary" />
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">Total Balance</span>
                      <span className="font-semibold" data-testid="text-header-balance">2,450.00 USDC</span>
                    </div>
                  </div>
                  
                  <Button size="sm" variant="default" data-testid="button-quick-send">
                    <Send className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                  
                  <Button size="sm" variant="outline" data-testid="button-quick-receive">
                    <ArrowDownToLine className="h-4 w-4 mr-2" />
                    Receive
                  </Button>
                </div>

                <ThemeToggle />
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
