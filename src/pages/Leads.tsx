import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, DollarSign, User, Building, Phone, Mail } from "lucide-react";
import AddLeadDialog from "@/components/forms/AddLeadDialog";

// Empty leads data - ready for backend integration
const initialLeads = {
  new: [],
  followUp: [],
  prospect: [],
  negotiation: [],
  won: [],
  lost: [],
};

const stageConfig = {
  new: { title: "New", color: "bg-blue-500", textColor: "text-blue-600", bgColor: "bg-blue-50" },
  followUp: { title: "Follow Up", color: "bg-yellow-500", textColor: "text-yellow-600", bgColor: "bg-yellow-50" },
  prospect: { title: "Prospect", color: "bg-purple-500", textColor: "text-purple-600", bgColor: "bg-purple-50" },
  negotiation: { title: "Negotiation", color: "bg-orange-500", textColor: "text-orange-600", bgColor: "bg-orange-50" },
  won: { title: "Won", color: "bg-green-500", textColor: "text-green-600", bgColor: "bg-green-50" },
  lost: { title: "Lost", color: "bg-red-500", textColor: "text-red-600", bgColor: "bg-red-50" },
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};

export default function Leads() {
  const [leads] = useState(initialLeads);
  const [dialogOpen, setDialogOpen] = useState(false);

  const calculateStageTotal = (stageLeads: any[]) => {
    return stageLeads.reduce((total, lead) => total + lead.value, 0);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Lead Pipeline</h1>
            <p className="text-muted-foreground">Manage your sales pipeline and track lead progress</p>
          </div>
          <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setDialogOpen(true)}>
            Add New Lead
          </Button>
        </div>
      </div>

      <AddLeadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => {}} />

      {/* Pipeline Board */}
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 overflow-x-auto">
        {Object.entries(leads).map(([stageKey, stageLeads]) => {
          const stage = stageConfig[stageKey as keyof typeof stageConfig];
          const total = calculateStageTotal(stageLeads);
          
          return (
            <Card key={stageKey} className="min-w-72">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${stage.color}`}></div>
                    <span>{stage.title}</span>
                    <Badge variant="secondary" className="text-xs">
                      {stageLeads.length}
                    </Badge>
                  </div>
                </CardTitle>
                <div className="text-sm font-semibold text-muted-foreground">
                  ${total.toLocaleString()}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className={`p-4 border-l-4 border-l-${stage.color.replace('bg-', '')} hover:shadow-md transition-shadow cursor-pointer`}>
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h3 className="font-medium text-sm text-foreground leading-tight">
                          {lead.title}
                        </h3>
                        <Button variant="ghost" size="sm" className="w-6 h-6 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>

                      {/* Company and Contact */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Building className="w-3 h-3" />
                          <span>{lead.company}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <User className="w-3 h-3" />
                          <span>{lead.contact}</span>
                        </div>
                      </div>

                      {/* Contact Info */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          <span className="truncate">{lead.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          <span>{lead.phone}</span>
                        </div>
                      </div>

                      {/* Value and Priority */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm font-semibold text-foreground">
                          <DollarSign className="w-3 h-3" />
                          {lead.value.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${getPriorityColor(lead.priority)}`}></span>
                          <span className="text-xs text-muted-foreground capitalize">
                            {lead.priority}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {stageLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No leads in this stage</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}