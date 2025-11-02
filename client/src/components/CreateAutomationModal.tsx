import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Repeat, Calendar, PiggyBank } from "lucide-react";
import type { Wallet } from "@shared/schema";

const automationSchema = z.object({
  walletId: z.string().min(1, "Please select a wallet"),
  type: z.enum(["recurring", "scheduled", "savings"]),
  name: z.string().min(1, "Name is required").max(100),
  amount: z.string().refine((val) => {
    const num = parseFloat(val);
    return !isNaN(num) && num > 0;
  }, "Amount must be greater than 0"),
  recipient: z.string().optional(),
  frequency: z.string().optional(),
  nextRunDate: z.string().optional(),
});

type AutomationFormData = z.infer<typeof automationSchema>;

interface CreateAutomationModalProps {
  open: boolean;
  onClose: () => void;
  initialType?: "recurring" | "scheduled" | "savings";
}

export function CreateAutomationModal({ open, onClose, initialType = "recurring" }: CreateAutomationModalProps) {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState<"recurring" | "scheduled" | "savings">(initialType);

  const { data: wallets } = useQuery<Wallet[]>({
    queryKey: ["/api/wallets"],
    enabled: open,
  });

  const form = useForm<AutomationFormData>({
    resolver: zodResolver(automationSchema),
    defaultValues: {
      type: selectedType,
      name: "",
      amount: "",
      recipient: "",
      frequency: "monthly",
      nextRunDate: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AutomationFormData) => {
      const payload = {
        ...data,
        amount: parseFloat(data.amount).toString(),
        nextRunDate: data.nextRunDate ? new Date(data.nextRunDate).toISOString() : undefined,
      };
      return apiRequest("POST", "/api/automations", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({ title: "Automation created successfully" });
      form.reset();
      onClose();
    },
    onError: (error: Error) => {
      toast({ 
        title: "Failed to create automation", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const onSubmit = (data: AutomationFormData) => {
    const submitData = { ...data, type: selectedType };
    createMutation.mutate(submitData);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type as typeof selectedType);
    form.setValue("type", type as typeof selectedType);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="modal-create-automation">
        <DialogHeader>
          <DialogTitle className="text-2xl">Create Payment Automation</DialogTitle>
          <DialogDescription>
            Set up automatic payments, scheduled transfers, or savings goals
          </DialogDescription>
        </DialogHeader>

        <Tabs value={selectedType} onValueChange={handleTypeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="recurring" data-testid="tab-create-recurring">
              <Repeat className="h-4 w-4 mr-2" />
              Recurring
            </TabsTrigger>
            <TabsTrigger value="scheduled" data-testid="tab-create-scheduled">
              <Calendar className="h-4 w-4 mr-2" />
              Scheduled
            </TabsTrigger>
            <TabsTrigger value="savings" data-testid="tab-create-savings">
              <PiggyBank className="h-4 w-4 mr-2" />
              Savings
            </TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
              <FormField
                control={form.control}
                name="walletId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-wallet">
                          <SelectValue placeholder="Select a wallet" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {wallets?.map((wallet) => (
                          <SelectItem key={wallet.id} value={wallet.id}>
                            {wallet.name} (${parseFloat(wallet.balance).toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which wallet to use for this automation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <TabsContent value="recurring" className="space-y-6 mt-0">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Automation Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Monthly rent payment" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this recurring payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} data-testid="input-recipient" />
                      </FormControl>
                      <FormDescription>
                        The wallet address to send USDC to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USDC)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100.00" {...field} data-testid="input-amount" />
                      </FormControl>
                      <FormDescription>
                        Amount to send on each payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often to execute this payment
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextRunDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormDescription>
                        When to start the recurring payments
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="scheduled" className="space-y-6 mt-0">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transfer Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Send to Alice" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormDescription>
                        A descriptive name for this scheduled transfer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="recipient"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recipient Address</FormLabel>
                      <FormControl>
                        <Input placeholder="0x..." {...field} data-testid="input-recipient" />
                      </FormControl>
                      <FormDescription>
                        The wallet address to send USDC to
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount (USDC)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="100.00" {...field} data-testid="input-amount" />
                      </FormControl>
                      <FormDescription>
                        Amount to send
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextRunDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Scheduled Date & Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-scheduled-date" />
                      </FormControl>
                      <FormDescription>
                        When to execute this transfer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="savings" className="space-y-6 mt-0">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Savings Goal Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Emergency fund" {...field} data-testid="input-name" />
                      </FormControl>
                      <FormDescription>
                        A name for this savings goal
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Amount (USDC)</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="50.00" {...field} data-testid="input-amount" />
                      </FormControl>
                      <FormDescription>
                        How much to save on each contribution
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-frequency">
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="biweekly">Bi-weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        How often to make contributions
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nextRunDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} data-testid="input-start-date" />
                      </FormControl>
                      <FormDescription>
                        When to start saving
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </TabsContent>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={createMutation.isPending}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending} data-testid="button-create">
                  {createMutation.isPending ? "Creating..." : "Create Automation"}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
