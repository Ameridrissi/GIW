import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Plus, Play, Pause, Trash2, Calendar, Repeat, PiggyBank, ArrowRight } from "lucide-react";
import type { Automation } from "@shared/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AutomationsPage() {
  const { toast } = useToast();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<"recurring" | "scheduled" | "savings">("recurring");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: automations, isLoading } = useQuery<Automation[]>({
    queryKey: ["/api/automations"],
  });

  const pauseMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "active" | "paused" }) => {
      return apiRequest("PATCH", `/api/automations/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({ title: "Automation updated successfully" });
    },
    onError: () => {
      toast({ title: "Failed to update automation", variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/automations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/automations"] });
      toast({ title: "Automation deleted successfully" });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete automation", variant: "destructive" });
    },
  });

  const recurringAutomations = automations?.filter((a) => a.type === "recurring") || [];
  const scheduledAutomations = automations?.filter((a) => a.type === "scheduled") || [];
  const savingsAutomations = automations?.filter((a) => a.type === "savings") || [];

  const getFrequencyDisplay = (frequency: string | null) => {
    if (!frequency) return "One-time";
    const map: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      biweekly: "Bi-weekly",
      monthly: "Monthly",
    };
    return map[frequency] || frequency;
  };

  const formatNextRun = (date: Date | null) => {
    if (!date) return "Not scheduled";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const AutomationCard = ({ automation }: { automation: Automation }) => {
    const Icon = automation.type === "recurring" ? Repeat : automation.type === "scheduled" ? Calendar : PiggyBank;
    
    return (
      <Card className="hover-elevate" data-testid={`card-automation-${automation.id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 gap-2">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="p-2 rounded-lg bg-primary/10">
              <Icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base truncate" data-testid={`text-automation-name-${automation.id}`}>
                {automation.name}
              </CardTitle>
              <CardDescription className="text-sm">
                {automation.recipient ? `To: ${automation.recipient}` : "Savings goal"}
              </CardDescription>
            </div>
          </div>
          <Badge variant={automation.status === "active" ? "default" : "secondary"} data-testid={`badge-status-${automation.id}`}>
            {automation.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Amount</p>
              <p className="font-semibold" data-testid={`text-amount-${automation.id}`}>
                ${parseFloat(automation.amount).toFixed(2)} USDC
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Frequency</p>
              <p className="font-semibold">{getFrequencyDisplay(automation.frequency)}</p>
            </div>
          </div>
          
          {automation.nextRunDate && (
            <div className="text-sm">
              <p className="text-muted-foreground">Next Run</p>
              <p className="font-semibold" data-testid={`text-next-run-${automation.id}`}>
                {formatNextRun(automation.nextRunDate)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => pauseMutation.mutate({ 
                id: automation.id, 
                status: automation.status === "active" ? "paused" : "active" 
              })}
              disabled={pauseMutation.isPending}
              data-testid={`button-toggle-${automation.id}`}
            >
              {automation.status === "active" ? (
                <>
                  <Pause className="h-4 w-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDeleteId(automation.id)}
              data-testid={`button-delete-${automation.id}`}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const EmptyState = ({ type }: { type: string }) => (
    <Card className="p-12 text-center">
      <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
        {type === "recurring" && <Repeat className="h-8 w-8 text-muted-foreground" />}
        {type === "scheduled" && <Calendar className="h-8 w-8 text-muted-foreground" />}
        {type === "savings" && <PiggyBank className="h-8 w-8 text-muted-foreground" />}
      </div>
      <h3 className="text-lg font-semibold mb-2">No {type} automations yet</h3>
      <p className="text-muted-foreground mb-4">
        {type === "recurring" && "Set up automatic payments that repeat on a schedule"}
        {type === "scheduled" && "Schedule one-time transfers for a specific date"}
        {type === "savings" && "Create savings goals and automate contributions"}
      </p>
      <Button
        onClick={() => {
          setSelectedType(type as any);
          setCreateModalOpen(true);
        }}
        data-testid={`button-create-${type}`}
      >
        <Plus className="h-4 w-4 mr-2" />
        Create {type} automation
      </Button>
    </Card>
  );

  return (
    <div className="container max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" data-testid="heading-automations">Payment Automations</h1>
          <p className="text-muted-foreground mt-1">
            Set up recurring payments, scheduled transfers, and savings goals
          </p>
        </div>
        <Button onClick={() => setCreateModalOpen(true)} data-testid="button-create-automation">
          <Plus className="h-4 w-4 mr-2" />
          New Automation
        </Button>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" data-testid="tab-all">
            All ({automations?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="recurring" data-testid="tab-recurring">
            <Repeat className="h-4 w-4 mr-2" />
            Recurring ({recurringAutomations.length})
          </TabsTrigger>
          <TabsTrigger value="scheduled" data-testid="tab-scheduled">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduled ({scheduledAutomations.length})
          </TabsTrigger>
          <TabsTrigger value="savings" data-testid="tab-savings">
            <PiggyBank className="h-4 w-4 mr-2" />
            Savings ({savingsAutomations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading automations...</p>
            </Card>
          ) : automations && automations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {automations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          ) : (
            <EmptyState type="all" />
          )}
        </TabsContent>

        <TabsContent value="recurring" className="space-y-4">
          {recurringAutomations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {recurringAutomations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          ) : (
            <EmptyState type="recurring" />
          )}
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          {scheduledAutomations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {scheduledAutomations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          ) : (
            <EmptyState type="scheduled" />
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          {savingsAutomations.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {savingsAutomations.map((automation) => (
                <AutomationCard key={automation.id} automation={automation} />
              ))}
            </div>
          ) : (
            <EmptyState type="savings" />
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Automation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this automation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              data-testid="button-confirm-delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
