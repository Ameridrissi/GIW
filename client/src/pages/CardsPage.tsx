import { PaymentCard } from "@/components/PaymentCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function CardsPage() {
  const cards = [
    {
      type: "visa" as const,
      last4: "4242",
      expiry: "12/25",
      isDefault: true,
      cardholderName: "John Doe",
    },
    {
      type: "mastercard" as const,
      last4: "5555",
      expiry: "08/26",
      isDefault: false,
      cardholderName: "John Doe",
    },
    {
      type: "visa" as const,
      last4: "1234",
      expiry: "03/27",
      isDefault: false,
      cardholderName: "John Doe",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold font-display mb-2">Payment Cards</h1>
          <p className="text-muted-foreground">Manage your linked payment methods</p>
        </div>
        <Button data-testid="button-add-card" onClick={() => console.log('Add card clicked')}>
          <Plus className="h-5 w-5 mr-2" />
          Add Card
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, index) => (
          <PaymentCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
