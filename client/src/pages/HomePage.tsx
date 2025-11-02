import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { ArrowRight, Wallet, Brain, Zap, Shield } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_blockchain_network_background_010a2c15.png";

export default function HomePage() {
  const features = [
    {
      icon: Wallet,
      title: "Universal Wallet",
      description: "Create your USDC wallet and connect multiple payment methods globally",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Brain,
      title: "AI Wealth Assistant",
      description: "Chat with your personal AI advisor for smart financial decisions",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: Zap,
      title: "Payment Automation",
      description: "Automate future payments, recurring bills, and scheduled transfers",
      color: "from-orange-500 to-red-500",
    },
    {
      icon: Shield,
      title: "Global Security",
      description: "Enterprise-grade security with instant deposits and withdrawals",
      color: "from-green-500 to-emerald-500",
    },
  ];

  const news = [
    {
      id: "1",
      title: "USDC Integration Expands on Arc Blockchain",
      summary: "Circle announces new features for USDC on Arc blockchain, enabling faster transactions and lower fees.",
      source: "CryptoNews",
      date: "2 hours ago",
      category: "Blockchain",
    },
    {
      id: "2",
      title: "AI in Finance: The Future of Payment Analytics",
      summary: "How artificial intelligence is revolutionizing personal finance management and spending insights.",
      source: "FinTech Daily",
      date: "5 hours ago",
      category: "AI",
    },
    {
      id: "3",
      title: "Circle Launches Enhanced Security Features",
      summary: "New PIN authentication system provides additional layer of security for wallet operations.",
      source: "Blockchain Times",
      date: "1 day ago",
      category: "Security",
    },
  ];

  return (
    <div className="min-h-screen">
      <div 
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 text-white">
            <span className="gradient-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400">Global International Wallet</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Pay Anywhere, Everywhere. Your universal USDC wallet for seamless global payments with AI-powered insights
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              data-testid="button-get-started"
              onClick={() => window.location.href = '/api/login'}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              data-testid="button-learn-more"
              onClick={() => window.location.href = '/api/login'}
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold font-display mb-4">Why Choose GIW?</h2>
          <p className="text-xl text-muted-foreground">
            Everything you need for modern digital payments
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature) => (
            <div key={feature.title} className="text-center group">
              <div className={`h-16 w-16 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mx-auto mb-4 shadow-lg transform group-hover:scale-110 transition-transform`}>
                <feature.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold font-display mb-6">Latest Blockchain News</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((article) => (
            <NewsCard
              key={article.id}
              title={article.title}
              summary={article.summary}
              source={article.source}
              date={article.date}
              category={article.category}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
