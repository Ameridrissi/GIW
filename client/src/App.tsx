import { Switch, Route } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/hooks/useAuth";
import { initializeCircleSDK } from "@/lib/circleSDK";
import HomePage from "@/pages/HomePage";
import DashboardPage from "@/pages/DashboardPage";
import WalletPage from "@/pages/WalletPage";
import InsightsPage from "@/pages/InsightsPage";
import AutomationsPage from "@/pages/AutomationsPage";
import CardsPage from "@/pages/CardsPage";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show the landing page at all routes
  if (!isAuthenticated) {
    return <HomePage />;
  }

  return (
    <Switch>
      <Route path="/" component={DashboardPage} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/insights" component={InsightsPage} />
      <Route path="/automations" component={AutomationsPage} />
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

  useEffect(() => {
    // Initialize Circle SDK
    const CIRCLE_APP_ID = "502da187-5a8a-53c5-9856-3d9a9ac6dd56";
    try {
      initializeCircleSDK(CIRCLE_APP_ID);
    } catch (error) {
      console.error('[Circle SDK] Initialization failed:', error);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SidebarProvider style={style as React.CSSProperties}>
          <AuthWrapper />
        </SidebarProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

function AuthWrapper() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <HomePage />;
  }

  return (
    <div className="flex h-screen w-full">
      <AppSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="border-b bg-background">
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
            <div className="animate-slide-banner whitespace-nowrap py-4 px-4">
              <span className="inline-block text-white text-lg font-semibold">
                Welcome to GIW - Pay Anywhere, Everywhere! • 0% Fees on International Transfers • AI-Powered Wealth Management • Instant USDC Deposits & Withdrawals • Secure Blockchain Transactions • 24/7 Global Support • 
              </span>
              <span className="inline-block text-white text-lg font-semibold">
                Welcome to GIW - Pay Anywhere, Everywhere! • 0% Fees on International Transfers • AI-Powered Wealth Management • Instant USDC Deposits & Withdrawals • Secure Blockchain Transactions • 24/7 Global Support • 
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
  );
}

export default App;
