import { SpendingInsightCard } from "@/components/SpendingInsightCard";
import { CategorySpendingChart } from "@/components/CategorySpendingChart";
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { AIInsightAlert } from "@/components/AIInsightAlert";
import { AIChat } from "@/components/AIChat";

export default function InsightsPage() {
  const spendingTrend = [
    { month: "Jun", amount: 1200 },
    { month: "Jul", amount: 1450 },
    { month: "Aug", amount: 1100 },
    { month: "Sep", amount: 1380 },
    { month: "Oct", amount: 1520 },
    { month: "Nov", amount: 1234 },
  ];

  const categoryData = [
    { category: "Shopping", amount: 450, color: "hsl(221, 83%, 53%)" },
    { category: "Food", amount: 280, color: "hsl(262, 83%, 58%)" },
    { category: "Travel", amount: 620, color: "hsl(291, 64%, 42%)" },
    { category: "Bills", amount: 340, color: "hsl(334, 86%, 46%)" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold font-display mb-2">AI Insights</h1>
        <p className="text-muted-foreground">
          Personalized spending analysis and recommendations
        </p>
      </div>

      <AIInsightAlert
        message="You're on track to save $200 more this month compared to your average. Great job!"
        type="success"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SpendingInsightCard
          title="This Month"
          amount="$1,234.56"
          change="-12%"
          trend="down"
          description="You're spending 12% less than last month"
        />
        <SpendingInsightCard
          title="Average Daily"
          amount="$42.15"
          change="+5%"
          trend="up"
          description="Slightly higher than usual"
        />
        <SpendingInsightCard
          title="Top Category"
          amount="$620.00"
          change="+18%"
          trend="up"
          description="Travel expenses increased"
        />
        <SpendingInsightCard
          title="Savings Goal"
          amount="$1,500.00"
          change="-8%"
          trend="down"
          description="82% complete for this month"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-6">Spending Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendingTrend}>
                <XAxis 
                  dataKey="month" 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  formatter={(value) => [`$${value}`, "Spending"]}
                  contentStyle={{ 
                    borderRadius: "8px",
                    border: "1px solid hsl(var(--border))",
                    backgroundColor: "hsl(var(--card))"
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <CategorySpendingChart data={categoryData} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">AI Recommendations</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-1">Switch to USDC for travel</h4>
              <p className="text-sm text-muted-foreground">
                You could save approximately $45 on foreign transaction fees by using USDC instead of your Visa card for international purchases.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-1">Set up recurring payments</h4>
              <p className="text-sm text-muted-foreground">
                Your Netflix and Spotify subscriptions could be automated. This would save you time and never miss a payment.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <h4 className="font-semibold mb-1">Optimize bill splitting</h4>
              <p className="text-sm text-muted-foreground">
                You frequently split restaurant bills. Enable automatic splitting to make the process instant.
              </p>
            </div>
          </div>
        </Card>

        <AIChat />
      </div>
    </div>
  );
}
