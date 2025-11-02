import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertPaymentCardSchema } from "@shared/schema";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

const cardFormSchema = insertPaymentCardSchema.omit({ userId: true });

type CardFormData = z.infer<typeof cardFormSchema>;

export function AddCardModal({ open, onClose }: AddCardModalProps) {
  const { toast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<CardFormData>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      type: "visa",
      last4: "",
      expiry: "",
      cardholderName: "",
      isDefault: false,
    },
  });

  const cardType = watch("type");

  const addCardMutation = useMutation({
    mutationFn: async (data: CardFormData) => {
      return apiRequest("POST", "/api/cards", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cards"] });
      toast({
        title: "Card Added",
        description: "Your payment card has been added successfully.",
      });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add card. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CardFormData) => {
    addCardMutation.mutate(data);
  };

  const handleClose = () => {
    if (!addCardMutation.isPending) {
      reset();
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-add-card">
        <DialogHeader>
          <DialogTitle>Add Payment Card</DialogTitle>
          <DialogDescription>
            Add a new payment card to fund your wallet
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardType">Card Type</Label>
            <Select
              value={cardType}
              onValueChange={(value) => setValue("type", value as "visa" | "mastercard" | "amex")}
            >
              <SelectTrigger id="cardType" data-testid="select-card-type">
                <SelectValue placeholder="Select card type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="visa">Visa</SelectItem>
                <SelectItem value="mastercard">Mastercard</SelectItem>
                <SelectItem value="amex">American Express</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardholderName">Cardholder Name</Label>
            <Input
              id="cardholderName"
              placeholder="John Doe"
              {...register("cardholderName")}
              data-testid="input-cardholder-name"
            />
            {errors.cardholderName && (
              <p className="text-sm text-destructive">{errors.cardholderName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="last4">Last 4 Digits</Label>
            <Input
              id="last4"
              placeholder="1234"
              maxLength={4}
              {...register("last4")}
              data-testid="input-last4"
            />
            {errors.last4 && (
              <p className="text-sm text-destructive">{errors.last4.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry">Expiry Date (MM/YY)</Label>
            <Input
              id="expiry"
              placeholder="12/25"
              maxLength={5}
              {...register("expiry")}
              data-testid="input-expiry"
            />
            {errors.expiry && (
              <p className="text-sm text-destructive">{errors.expiry.message}</p>
            )}
          </div>

          <div className="p-3 bg-muted rounded-lg">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> For security, we only store the last 4 digits of your card.
              Full card details are handled securely by our payment processor.
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="flex-1"
              disabled={addCardMutation.isPending}
              data-testid="button-cancel-add-card"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={addCardMutation.isPending}
              data-testid="button-submit-add-card"
            >
              {addCardMutation.isPending ? "Adding..." : "Add Card"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
