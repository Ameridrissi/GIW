import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Star, Trash2 } from "lucide-react";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";

interface PaymentCardProps {
  id: string;
  type: "visa" | "mastercard" | "amex";
  last4: string;
  expiry: string;
  isDefault?: boolean;
  cardholderName: string;
  onSetDefault?: () => void;
  onDelete?: () => void;
}

export function PaymentCard({ 
  id,
  type, 
  last4, 
  expiry, 
  isDefault, 
  cardholderName,
  onSetDefault,
  onDelete 
}: PaymentCardProps) {
  const CardIcon = 
    type === "visa" ? SiVisa : 
    type === "mastercard" ? SiMastercard : 
    SiAmericanexpress;
  
  return (
    <Card className="p-6 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground" data-testid={`card-payment-${id}`}>
      <div className="flex justify-between items-start mb-8">
        <CardIcon className="h-8 w-8" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-primary-foreground hover:bg-primary-foreground/10" 
              data-testid={`button-card-menu-${id}`}
            >
              <MoreVertical className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {!isDefault && onSetDefault && (
              <DropdownMenuItem onClick={onSetDefault} data-testid={`button-set-default-${id}`}>
                <Star className="h-4 w-4 mr-2" />
                Set as Default
              </DropdownMenuItem>
            )}
            {onDelete && (
              <DropdownMenuItem 
                onClick={onDelete} 
                className="text-destructive"
                data-testid={`button-delete-card-${id}`}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Card
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
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
