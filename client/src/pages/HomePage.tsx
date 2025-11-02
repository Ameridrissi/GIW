import { Button } from "@/components/ui/button";
import { NewsCard } from "@/components/NewsCard";
import { ArrowRight, Wallet, Brain, Zap, Shield } from "lucide-react";
import heroImage from "@assets/generated_images/Hero_blockchain_network_background_010a2c15.png";

export default function HomePage() {
  const features = [
    {
      icon: Wallet,
      title: "Multi-Wallet Support",
      description: "Connect multiple payment cards and USDC wallets in one secure place",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Get smart recommendations and spending analysis powered by AI",
    },
    {
      icon: Zap,
      title: "Smart Automation",
      description: "Set up recurring payments and automatic bill splitting",
    },
    {
      icon: Shield,
      title: "Secure Transactions",
      description: "Circle Auth PIN and blockchain security for all payments",
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
        className="relative h-[500px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.7)), url(${heroImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
          <h1 className="text-5xl md:text-7xl font-bold font-display mb-6 text-white">
            Smart USDC Wallet with AI Insights
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8">
            Manage your payments, track spending, and get AI-powered financial insights all in one place
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8"
              data-testid="button-get-started"
              onClick={() => console.log('Get started clicked')}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20"
              data-testid="button-learn-more"
              onClick={() => console.log('Learn more clicked')}
            >
              Learn More
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
            <div key={feature.title} className="text-center">
              <div className="h-16 w-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-8 w-8 text-primary" />
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
