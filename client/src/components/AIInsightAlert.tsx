import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface AIInsightAlertProps {
  message: string;
  type: "tip" | "warning" | "success";
}

export function AIInsightAlert({ message, type }: AIInsightAlertProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const colors = {
    tip: "border-primary/50 bg-primary/5",
    warning: "border-destructive/50 bg-destructive/5",
    success: "border-green-500/50 bg-green-500/5",
  };

  return (
    <Alert className={`${colors[type]} border-l-4`} data-testid="alert-ai-insight">
      <Lightbulb className="h-5 w-5" />
      <AlertDescription className="flex items-start justify-between gap-4">
        <span className="flex-1">{message}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 shrink-0"
          onClick={() => setIsVisible(false)}
          data-testid="button-dismiss-alert"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  );
}
