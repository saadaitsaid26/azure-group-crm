import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  icon: ReactNode;
  description?: string;
}

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeType, 
  icon, 
  description 
}: KPICardProps) {
  return (
    <div className="crm-card">
      <div className="crm-card-header">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-sm text-muted-foreground">{title}</h3>
            <p className="text-2xl font-bold text-foreground">{value}</p>
          </div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className={cn(
          "flex items-center gap-1 text-sm font-medium",
          changeType === "positive" && "text-success",
          changeType === "negative" && "text-destructive",
          changeType === "neutral" && "text-muted-foreground"
        )}>
          {changeType === "positive" && <TrendingUp className="w-4 h-4" />}
          {changeType === "negative" && <TrendingDown className="w-4 h-4" />}
          <span>{change}</span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}