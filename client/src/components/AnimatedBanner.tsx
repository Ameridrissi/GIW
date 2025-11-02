import { Globe, Lock, Zap, TrendingUp, Users, CreditCard } from "lucide-react";

export function AnimatedBanner() {
  const items = [
    { icon: Globe, text: "Global Payments" },
    { icon: Lock, text: "Bank-Grade Security" },
    { icon: Zap, text: "Instant Transfers" },
    { icon: TrendingUp, text: "AI-Powered Insights" },
    { icon: Users, text: "Trusted by Millions" },
    { icon: CreditCard, text: "Multiple Currencies" },
  ];

  return (
    <div className="relative overflow-hidden bg-primary py-3 border-y border-primary-border">
      <div className="flex animate-slide-banner">
        {/* Duplicate items for seamless loop */}
        {[...items, ...items].map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-8 whitespace-nowrap"
            data-testid={`banner-item-${index}`}
          >
            <item.icon className="h-5 w-5 text-primary-foreground" />
            <span className="text-sm font-medium text-primary-foreground">
              {item.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
