import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function AIChat() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your AI wealth management assistant. I can help you with investment strategies, budgeting advice, and financial planning. How can I assist you today?",
    },
  ]);
  const [input, setInput] = useState("");

  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      const response = await apiRequest("POST", "/api/ai/chat", { message });
      return response.json();
    },
    onSuccess: (data: any) => {
      const aiMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
      };
      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error: Error) => {
      console.error("AI chat error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || chatMutation.isPending) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    chatMutation.mutate(input);
    setInput("");
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <div className="p-6 border-b">
        <h3 className="text-xl font-semibold flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Wealth Assistant
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Get professional financial advice powered by AI
        </p>
      </div>

      <ScrollArea className="flex-1 p-6">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {message.role === "assistant" && (
                <Avatar className="h-8 w-8 bg-primary/10">
                  <AvatarFallback>
                    <Bot className="h-4 w-4 text-primary" />
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={`rounded-lg px-4 py-3 max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
                data-testid={`message-${message.role}`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback>
                    <User className="h-4 w-4 text-primary-foreground" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {chatMutation.isPending && (
            <div className="flex gap-3 justify-start">
              <Avatar className="h-8 w-8 bg-primary/10">
                <AvatarFallback>
                  <Bot className="h-4 w-4 text-primary" />
                </AvatarFallback>
              </Avatar>
              <div className="rounded-lg px-4 py-3 bg-muted">
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-primary/50 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <form onSubmit={handleSend} className="p-6 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about investments, budgeting, or financial planning..."
            data-testid="input-ai-chat"
            disabled={chatMutation.isPending}
          />
          <Button 
            type="submit" 
            size="icon" 
            data-testid="button-send-message"
            disabled={chatMutation.isPending || !input.trim()}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </form>
    </Card>
  );
}
