import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  Calendar, 
  Clock, 
  User, 
  Target,
  FileText,
  Phone,
  Mail,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

// Empty activities data - ready for backend integration
const activitiesData: any[] = [];

const getTypeIcon = (type: string) => {
  switch (type) {
    case "Call":
      return <Phone className="w-4 h-4" />;
    case "Email":
      return <Mail className="w-4 h-4" />;
    case "Meeting":
      return <Calendar className="w-4 h-4" />;
    case "Task":
      return <FileText className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case "Call":
      return "bg-blue-100 text-blue-800";
    case "Email":
      return "bg-green-100 text-green-800";
    case "Meeting":
      return "bg-purple-100 text-purple-800";
    case "Task":
      return "bg-orange-100 text-orange-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
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

export default function Activities() {
  const [activities] = useState(activitiesData);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [filterType, setFilterType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesSearch = activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.createdBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.lead.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         activity.comment.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || activity.type === filterType;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "done" && activity.isDone) ||
                         (filterStatus === "pending" && !activity.isDone);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivities.slice(startIndex, startIndex + itemsPerPage);

  const handleSelectActivity = (activityId: number) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const handleSelectAll = () => {
    if (selectedActivities.length === paginatedActivities.length) {
      setSelectedActivities([]);
    } else {
      setSelectedActivities(paginatedActivities.map(activity => activity.id));
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
          <p className="text-muted-foreground">Track and manage all CRM activities and scheduled tasks</p>
        </div>
        <Button className="bg-gradient-primary hover:opacity-90 flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Activity
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activities.length}</p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activities.filter(a => a.isDone).length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activities.filter(a => !a.isDone).length}</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Target className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{activities.filter(a => a.priority === 'high' && !a.isDone).length}</p>
                <p className="text-sm text-muted-foreground">High Priority</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search activities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Call">Call</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Meeting">Meeting</SelectItem>
                <SelectItem value="Task">Task</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedActivities.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-foreground">
                {selectedActivities.length} activities selected
              </p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  Mark Complete
                </Button>
                <Button size="sm" variant="outline">
                  Delete Selected
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activities Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activities List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2">
                    <Checkbox
                      checked={selectedActivities.length === paginatedActivities.length && paginatedActivities.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID/Title/Created By</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Is Done</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Comment/Lead/Type</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Schedule From/To</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created At</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedActivities.map((activity) => {
                  const scheduleFrom = formatDateTime(activity.scheduleFrom);
                  const scheduleTo = formatDateTime(activity.scheduleTo);
                  const createdAt = formatDateTime(activity.createdAt);
                  
                  return (
                    <tr key={activity.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                      <td className="py-4 px-2">
                        <Checkbox
                          checked={selectedActivities.includes(activity.id)}
                          onCheckedChange={() => handleSelectActivity(activity.id)}
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">#{activity.id}</span>
                            <span className={`w-2 h-2 rounded-full ${getPriorityColor(activity.priority)}`}></span>
                          </div>
                          <p className="font-medium text-foreground">{activity.title}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <User className="w-3 h-3" />
                            <span>{activity.createdBy}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          {activity.isDone ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          )}
                          <Badge className={activity.isDone ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"}>
                            {activity.isDone ? "Done" : "Pending"}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <p className="text-sm text-foreground">{activity.comment}</p>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Target className="w-3 h-3" />
                            <span>{activity.lead}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge className={getTypeColor(activity.type)}>
                              <div className="flex items-center gap-1">
                                {getTypeIcon(activity.type)}
                                <span>{activity.type}</span>
                              </div>
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm space-y-1">
                          <div>
                            <p className="font-medium text-foreground">From: {scheduleFrom.date}</p>
                            <p className="text-muted-foreground">{scheduleFrom.time}</p>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">To: {scheduleTo.date}</p>
                            <p className="text-muted-foreground">{scheduleTo.time}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm">
                          <p className="text-foreground">{createdAt.date}</p>
                          <p className="text-muted-foreground">{createdAt.time}</p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-destructive hover:text-destructive">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredActivities.length)} of {filteredActivities.length} items
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No activities found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try adjusting your search criteria' : 'Get started by creating your first activity'}
              </p>
              <Button className="bg-gradient-primary hover:opacity-90">
                Add Activity
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}