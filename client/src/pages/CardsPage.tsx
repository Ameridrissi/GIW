import { PaymentCard } from "@/components/PaymentCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus, CreditCard } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { AddCardModal } from "@/components/AddCardModal";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { PaymentCard as PaymentCardType } from "@shared/schema";

export default function CardsPage() {
  const [showAddCard, setShowAddCard] = useState(false);
  const { toast } = useToast();

  const { data: cards = [], isLoading, error } = useQuery<PaymentCardType[]>({
    queryKey: ["/api/cards"],
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest("PATCH", `/api/cards/${cardId}/default`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Default Card Updated",
        description: "Your default payment method has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update default card.",
        variant: "destructive",
      });
    },
  });

  const deleteCardMutation = useMutation({
    mutationFn: async (cardId: string) => {
      return apiRequest("DELETE", `/api/cards/${cardId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Card Removed",
        description: "Payment card has been removed successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove card.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">Payment Cards</h1>
            <p className="text-muted-foreground">Manage your linked payment methods</p>
          </div>
          <Button disabled>
            <Plus className="h-5 w-5 mr-2" />
            Add Card
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold font-display mb-2">Payment Cards</h1>
            <p className="text-muted-foreground">Manage your linked payment methods</p>
          </div>
        </div>
        <Card className="p-8 text-center">
          <div className="text-destructive text-lg font-semibold mb-2">Failed to load cards</div>
          <p className="text-muted-foreground">Please try refreshing the page</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Payment Cards</h1>
          <p className="text-muted-foreground">Manage your linked payment methods</p>
        </div>
        <Button data-testid="button-add-card" onClick={() => setShowAddCard(true)}>
          <Plus className="h-5 w-5 mr-2" />
          Add Card
        </Button>
      </div>

      {cards.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">No Payment Cards</h3>
              <p className="text-muted-foreground mb-4">
                Add a payment card to fund your USDC wallet and make purchases
              </p>
              <Button onClick={() => setShowAddCard(true)} data-testid="button-add-first-card">
                <Plus className="h-5 w-5 mr-2" />
                Add Your First Card
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((card) => (
            <PaymentCard
              key={card.id}
              id={card.id}
              type={card.type}
              last4={card.last4}
              expiry={card.expiry}
              isDefault={card.isDefault}
              cardholderName={card.cardholderName}
              onSetDefault={() => setDefaultMutation.mutate(card.id)}
              onDelete={() => deleteCardMutation.mutate(card.id)}
            />
          ))}
        </div>
      )}

      <AddCardModal open={showAddCard} onClose={() => setShowAddCard(false)} />
    </div>
  );
}
