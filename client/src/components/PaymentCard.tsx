import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreditCard, MoreVertical } from "lucide-react";
import { SiVisa, SiMastercard } from "react-icons/si";

interface PaymentCardProps {
  type: "visa" | "mastercard";
  last4: string;
  expiry: string;
  isDefault?: boolean;
  cardholderName: string;
}

export function PaymentCard({ type, last4, expiry, isDefault, cardholderName }: PaymentCardProps) {
  const CardIcon = type === "visa" ? SiVisa : SiMastercard;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="flex justify-between items-start mb-8">
        <CardIcon className="h-8 w-8" />
        <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-card-menu">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="space-y-4">
        <div className="font-mono text-xl tracking-wider tabular-nums">
          •••• •••• •••• {last4}
        </div>
        
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs opacity-80 mb-1">Cardholder</p>
            <p className="font-medium">{cardholderName}</p>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80 mb-1">Expires</p>
            <p className="font-medium tabular-nums">{expiry}</p>
          </div>
        </div>
      </div>
      
      {isDefault && (
        <Badge variant="secondary" className="mt-4 bg-primary-foreground/20 text-primary-foreground border-0">
          Default
        </Badge>
      )}
    </Card>
  );
}
