import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MoreHorizontal, DollarSign, User, Building, Search, ChevronLeft, ChevronRight, Package } from "lucide-react";
import AddLeadDialog from "@/components/forms/AddLeadDialog";
import { useLeads, useLeadStats, useUpdateLead } from "@/api/leads";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";
import type { Lead as LeadType } from "@/schemas/lead.schema";

type Stage = LeadType["stage"];

const stageConfig: Record<Stage, { title: string; color: string }> = {
  new: { title: "New", color: "#3b82f6" },
  followUp: { title: "Follow Up", color: "#eab308" },
  prospect: { title: "Prospect", color: "#a855f7" },
  negotiation: { title: "Negotiation", color: "#f97316" },
  won: { title: "Won", color: "#22c55e" },
  lost: { title: "Lost", color: "#ef4444" },
};

const priorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-green-500";
    default:
      return "bg-gray-400";
  }
};

export default function Leads() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [hoverStage, setHoverStage] = useState<string | null>(null);
  // Optimistic stage changes while awaiting server
  const [pendingStage, setPendingStage] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const { data: leadsData, isLoading, error } = useLeads({
    q: searchQuery || undefined,
    stage: stageFilter || undefined,
    priority: priorityFilter || undefined,
    page,
    page_size: pageSize,
  });
  const { data: stats } = useLeadStats();
  const updateLead = useUpdateLead();

  const leads = leadsData?.results || [];
  const totalCount = leadsData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  // Apply any optimistic stage overrides to the current page's leads
  const leadsWithPending = useMemo(() => {
    if (!leads?.length) return [] as typeof leads;
    if (!pendingStage || Object.keys(pendingStage).length === 0) return leads;
    return leads.map((l) => {
      const maybe = pendingStage[l.id];
      if (maybe) {
        const newStage = maybe as Stage;
        return { ...l, stage: newStage } as LeadType;
      }
      return l;
    });
  }, [leads, pendingStage]);

  const leadsByStage: Record<string, typeof leads> = useMemo(() => {
    return leadsWithPending.reduce((acc, lead) => {
      const key = lead.stage;
      acc[key] = acc[key] || [];
      acc[key].push(lead);
      return acc;
    }, {} as Record<string, typeof leads>);
  }, [leadsWithPending]);

  const calculateStageTotal = (stageLeads: typeof leads) =>
    stageLeads.reduce((total, lead) => total + (parseFloat(lead.value || "0") || 0), 0);

  if (isLoading) return <LoadingSpinner />;
  if (error)
    return (
      <div className="p-6">
        <EmptyState icon={Package} title="Error loading leads" description="Please try again." />
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lead Pipeline</h1>
          <p className="text-muted-foreground">Manage your sales pipeline and track lead progress</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90" onClick={() => setDialogOpen(true)}>
          Add New Lead
        </Button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats.total_value || "0").toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Average Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${parseFloat(stats.average_value || "0").toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Won This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.by_stage.won || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
            <Input
              type="text"
              placeholder="Filter by stage (new, followUp, prospect, negotiation, won, lost)"
              value={stageFilter}
              onChange={(e) => {
                setStageFilter(e.target.value);
                setPage(1);
              }}
            />
            <Input
              type="text"
              placeholder="Filter by priority (high, medium, low)"
              value={priorityFilter}
              onChange={(e) => {
                setPriorityFilter(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Empty states */}
      {!leads.length && !searchQuery ? (
        <EmptyState
          icon={Package}
          title="No leads yet"
          description="Start building your pipeline by adding your first lead"
          actionLabel="Add Lead"
          onAction={() => setDialogOpen(true)}
        />
      ) : null}

      {!leads.length && searchQuery ? (
        <EmptyState icon={Package} title="No leads found" description={`No leads match "${searchQuery}"`} />
      ) : null}

      {/* Pipeline board */}
      {leads.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 overflow-x-auto">
          {Object.entries(stageConfig).map(([stageKey, stage]) => {
            const stageLeads = leadsByStage[stageKey] || [];
            const total = calculateStageTotal(stageLeads);

            const handleDragOver: React.DragEventHandler<HTMLDivElement> = (e) => {
              // Allow dropping by preventing default
              e.preventDefault();
              setHoverStage(stageKey);
            };

            const handleDrop: React.DragEventHandler<HTMLDivElement> = async (e) => {
              e.preventDefault();
              setHoverStage(null);
              const leadId = e.dataTransfer.getData("text/plain") || draggingId;
              if (!leadId) return;

              // Find current stage (apply pending override if present)
              const current = leadsWithPending.find((l) => l.id === leadId);
              const fromStage = current?.stage;
              if (!fromStage || fromStage === stageKey) return;

              // Optimistic update
              setPendingStage((prev) => ({ ...prev, [leadId]: stageKey }));
              try {
                await updateLead.mutateAsync({ id: leadId, data: { stage: stageKey as Stage } });
                toast({ title: "Lead moved", description: `Moved to ${stage.title}` });
              } catch (err: any) {
                // Revert on error
                setPendingStage((prev) => {
                  const copy = { ...prev };
                  delete copy[leadId];
                  return copy;
                });
                toast({ title: "Move failed", description: err?.message || "Could not update stage" });
              } finally {
                setDraggingId(null);
              }
            };

            return (
              <Card key={stageKey} className={`min-w-72 ${hoverStage === stageKey ? "ring-2 ring-offset-2 ring-primary/40" : ""}`}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span>{stage.title}</span>
                      <Badge variant="secondary" className="text-xs">
                        {stageLeads.length}
                      </Badge>
                    </div>
                    <div className="text-sm font-semibold text-muted-foreground">${total.toLocaleString()}</div>
                  </CardTitle>
                </CardHeader>
                <CardContent
                  className={`space-y-3 min-h-16 ${hoverStage === stageKey ? "bg-muted/40" : ""}`}
                  onDragOver={handleDragOver}
                  onDragEnter={() => setHoverStage(stageKey)}
                  onDragLeave={(e) => {
                    // Avoid flicker when moving within the same column
                    if ((e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) return;
                    setHoverStage(null);
                  }}
                  onDrop={handleDrop}
                  role="list"
                  aria-label={`${stage.title} leads`}
                >
                  {stageLeads.map((lead) => (
                    <Card
                      key={lead.id}
                      className={`p-4 border-l-4 hover:shadow-sm transition-shadow ${draggingId === lead.id ? "opacity-60" : ""}`}
                      style={{ borderLeftColor: stage.color }}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData("text/plain", lead.id);
                        e.dataTransfer.effectAllowed = "move";
                        setDraggingId(lead.id);
                      }}
                      onDragEnd={() => {
                        setDraggingId(null);
                        setHoverStage(null);
                      }}
                      role="listitem"
                      aria-grabbed={draggingId === lead.id}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3 className="font-medium text-sm text-foreground leading-tight">{lead.title}</h3>
                          <div className="space-y-1 text-xs text-muted-foreground">
                            {lead.organization_name && (
                              <div className="flex items-center gap-2">
                                <Building className="w-3 h-3" />
                                <span>{lead.organization_name}</span>
                              </div>
                            )}
                            {lead.contact_name && (
                              <div className="flex items-center gap-2">
                                <User className="w-3 h-3" />
                                <span>{lead.contact_name}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className={`w-2 h-2 rounded-full ${priorityColor(lead.priority)}`}></div>
                            <span className="text-muted-foreground capitalize">{lead.priority} priority</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 justify-end">
                            <DollarSign className="w-4 h-4 text-muted-foreground" />
                            <span className="font-semibold">{parseFloat(lead.value || "0").toLocaleString()}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="w-6 h-6 p-0 mt-2" aria-label="More options">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between pt-2">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages} • {totalCount} leads
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <AddLeadDialog open={dialogOpen} onOpenChange={setDialogOpen} onSuccess={() => setDialogOpen(false)} />
    </div>
  );
}