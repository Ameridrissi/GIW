import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

interface NewsCardProps {
  title: string;
  summary: string;
  source: string;
  date: string;
  category: string;
}

export function NewsCard({ title, summary, source, date, category }: NewsCardProps) {
  return (
    <Card className="p-6 hover-elevate cursor-pointer" data-testid="card-news">
      <div className="flex items-start justify-between mb-3">
        <Badge variant="secondary">{category}</Badge>
        <ExternalLink className="h-4 w-4 text-muted-foreground" />
      </div>
      
      <h3 className="text-lg font-semibold mb-2 line-clamp-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{summary}</p>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{source}</span>
        <span>{date}</span>
      </div>
    </Card>
  );
}
