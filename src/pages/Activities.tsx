import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Phone, Mail, Calendar, FileText, MessageSquare, CheckCircle2, Circle, AlertTriangle, Package, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react";
import { useActivities, useActivityStats, useToggleActivityDone, useDeleteActivity, useOverdueActivities, useUpcomingActivities } from "@/api/activities";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import AddActivityDialog from "@/components/forms/AddActivityDialog";
import EditActivityDialog from "@/components/forms/EditActivityDialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow, format, parseISO } from "date-fns";
import type { Activity } from "@/schemas/activity.schema";

const getTypeIcon = (type: string) => {
  switch (type) {
    case "call": return <Phone className="w-4 h-4" />;
    case "email": return <Mail className="w-4 h-4" />;
    case "meeting": return <Calendar className="w-4 h-4" />;
    case "task": return <CheckCircle2 className="w-4 h-4" />;
    case "note": return <MessageSquare className="w-4 h-4" />;
    default: return <FileText className="w-4 h-4" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case "call": return "bg-blue-100 text-blue-800";
    case "email": return "bg-purple-100 text-purple-800";
    case "meeting": return "bg-green-100 text-green-800";
    case "task": return "bg-orange-100 text-orange-800";
    case "note": return "bg-gray-100 text-gray-800";
    default: return "bg-gray-100 text-gray-800";
  }
};

export default function Activities() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const { data: activitiesData, isLoading, error } = useActivities({
    q: searchQuery || undefined,
    type: typeFilter === "all" ? undefined : typeFilter || undefined,
    is_done: statusFilter === "done" ? true : statusFilter === "pending" ? false : undefined,
    page,
    page_size: pageSize,
  });
  const { data: stats } = useActivityStats();
  const { data: upcomingData } = useUpcomingActivities();
  const { data: overdueData } = useOverdueActivities();
  const toggleDone = useToggleActivityDone();
  const deleteActivity = useDeleteActivity();

  const handleToggleDone = async (id: string, currentStatus: boolean) => {
    try {
      await toggleDone.mutateAsync(id);
      toast({ title: "Success", description: `Activity marked as ${currentStatus ? "pending" : "done"}` });
    } catch (error: any) {
      toast({ title: "Error", description: error?.response?.data?.detail || "Failed to update activity", variant: "destructive" });
    }
  };

  const handleEditActivity = (activity: Activity) => {
    setEditingActivity(activity);
    setEditDialogOpen(true);
  };

  const handleDeleteActivity = async (activity: Activity) => {
    const activityTitle = activity.title || `${activity.type} activity`;
    if (!confirm(`Are you sure you want to delete "${activityTitle}"?`)) return;

    try {
      await deleteActivity.mutateAsync(activity.id);
      toast({
        title: "Success",
        description: "Activity deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete activity",
        variant: "destructive",
      });
    }
  };

  const activities = activitiesData?.results || [];
  const totalCount = activitiesData?.count ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const upcoming = upcomingData || [];
  const overdue = overdueData || [];

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const handlePrev = () => setPage((p) => Math.max(1, p - 1));
  const handleNext = () => setPage((p) => Math.min(totalPages, p + 1));
  const handlePageSize = (value: string) => {
    const size = parseInt(value, 10) || 10;
    setPageSize(size);
    setPage(1);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <div className="p-8"><EmptyState icon={Package} title="Error loading activities" description="There was a problem loading the activities. Please try again." /></div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Activities</h1>
          <p className="text-muted-foreground mt-1">Track and manage all activities</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Activity
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Total</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats?.total || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats?.completed || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">{stats?.pending || 0}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Upcoming</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">{upcoming.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{overdue.length}</div></CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Types" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]"><SelectValue placeholder="All Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={String(pageSize)} onValueChange={handlePageSize}>
              <SelectTrigger className="w-full md:w-[140px]"><SelectValue placeholder="Page size" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 / page</SelectItem>
                <SelectItem value="20">20 / page</SelectItem>
                <SelectItem value="50">50 / page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List */}
      <Card>
        <CardContent className="pt-6 space-y-3">
          {activities.length === 0 ? (
            <EmptyState icon={Package} title="No activities" description="Try adjusting filters or add a new activity." />
          ) : (
            <div className="space-y-3">
              {activities.map((act) => {
                const isOverdue = !act.is_done && act.schedule_to && new Date(act.schedule_to) < new Date();
                return (
                  <div key={act.id} className="border rounded-md p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className={`mt-1 w-2 h-2 rounded-full ${act.is_done ? 'bg-green-500' : isOverdue ? 'bg-red-500' : 'bg-orange-500'}`} />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${getTypeBadgeColor(act.type)}`}>
                              {getTypeIcon(act.type)}
                              <span className="text-xs capitalize">{act.type}</span>
                            </span>
                            {act.title && <span className="font-medium">{act.title}</span>}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {act.organization_name && <span className="mr-2">Org: {act.organization_name}</span>}
                            {act.lead_title && <span className="mr-2">Lead: {act.lead_title}</span>}
                            {act.contact_name && <span className="mr-2">Contact: {act.contact_name}</span>}
                          </div>
                          {act.comment && <div className="text-sm mt-1">{act.comment}</div>}
                          <div className="text-xs text-muted-foreground mt-1">
                            {act.schedule_from && <span className="mr-2">From: {format(parseISO(act.schedule_from), 'PP p')}</span>}
                            {act.schedule_to && <span>To: {format(parseISO(act.schedule_to), 'PP p')}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={act.is_done ? 'default' : 'secondary'} 
                          className="cursor-pointer" 
                          onClick={() => handleToggleDone(act.id, act.is_done)}
                        >
                          {act.is_done ? 'Done' : 'Mark Done'}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-8 h-8 p-0" 
                          onClick={() => handleEditActivity(act)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50" 
                          onClick={() => handleDeleteActivity(act)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-2">
            <div className="text-sm text-muted-foreground">Page {page} of {totalPages} • {totalCount} activities</div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePrev} disabled={!canPrev}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" onClick={handleNext} disabled={!canNext}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AddActivityDialog open={showAddDialog} onOpenChange={setShowAddDialog} onSuccess={() => { setShowAddDialog(false); }} />
      <EditActivityDialog 
        activity={editingActivity} 
        open={editDialogOpen} 
        onOpenChange={setEditDialogOpen} 
        onSuccess={() => setEditDialogOpen(false)} 
      />
    </div>
  );
}
