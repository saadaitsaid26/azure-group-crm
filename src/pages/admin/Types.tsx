import { useState } from "react";
import { Plus, Search, Tag, Edit, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useActivityTypes,
  useActivityTypeStats,
  useDeleteActivityType,
  useContactTypes,
  useContactTypeStats,
  useDeleteContactType,
} from "@/api/reference";
import { AddActivityTypeDialog } from "@/components/forms/AddActivityTypeDialog";
import { EditActivityTypeDialog } from "@/components/forms/EditActivityTypeDialog";
import { AddContactTypeDialog } from "@/components/forms/AddContactTypeDialog";
import { EditContactTypeDialog } from "@/components/forms/EditContactTypeDialog";
import { toast } from "@/hooks/use-toast";
import type { ActivityType, ContactType } from "@/api/reference";

export default function AdminTypes() {
  const [activeTab, setActiveTab] = useState("activity");

  // Activity Types State
  const [activitySearchQuery, setActivitySearchQuery] = useState("");
  const [activityStatusFilter, setActivityStatusFilter] =
    useState<string>("all");
  const [addActivityDialogOpen, setAddActivityDialogOpen] = useState(false);
  const [editActivityDialogOpen, setEditActivityDialogOpen] = useState(false);
  const [deleteActivityDialogOpen, setDeleteActivityDialogOpen] =
    useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | null>(
    null
  );

  // Contact Types State
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactStatusFilter, setContactStatusFilter] = useState<string>("all");
  const [addContactDialogOpen, setAddContactDialogOpen] = useState(false);
  const [editContactDialogOpen, setEditContactDialogOpen] = useState(false);
  const [deleteContactDialogOpen, setDeleteContactDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<ContactType | null>(
    null
  );

  // Activity Types Data
  const activityFilters = {
    q: activitySearchQuery || undefined,
    is_active:
      activityStatusFilter === "all"
        ? undefined
        : activityStatusFilter === "active",
  };
  const { data: activityTypesData, isLoading: activityTypesLoading } =
    useActivityTypes(activityFilters);
  const { data: activityStats } = useActivityTypeStats();
  const deleteActivityType = useDeleteActivityType();
  const activityTypes = activityTypesData?.results || [];

  // Contact Types Data
  const contactFilters = {
    q: contactSearchQuery || undefined,
    is_active:
      contactStatusFilter === "all"
        ? undefined
        : contactStatusFilter === "active",
  };
  const { data: contactTypesData, isLoading: contactTypesLoading } =
    useContactTypes(contactFilters);
  const { data: contactStats } = useContactTypeStats();
  const deleteContactType = useDeleteContactType();
  const contactTypes = contactTypesData?.results || [];

  const handleDeleteActivity = async () => {
    if (!selectedActivity) return;

    try {
      await deleteActivityType.mutateAsync(selectedActivity.id);
      toast({
        title: "Success",
        description: "Activity type deleted successfully",
      });
      setDeleteActivityDialogOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete activity type",
        variant: "destructive",
      });
    }
  };

  const handleDeleteContact = async () => {
    if (!selectedContact) return;

    try {
      await deleteContactType.mutateAsync(selectedContact.id);
      toast({
        title: "Success",
        description: "Contact type deleted successfully",
      });
      setDeleteContactDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to delete contact type",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Types & Categories
          </h1>
          <p className="text-muted-foreground">
            Configure activity and contact types
          </p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            if (activeTab === "activity") {
              setAddActivityDialogOpen(true);
            } else {
              setAddContactDialogOpen(true);
            }
          }}
        >
          <Plus className="h-4 w-4" />
          Add {activeTab === "activity" ? "Activity Type" : "Contact Type"}
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Activity Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activityStats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {activityStats?.active || 0} active
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contact Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contactStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {contactStats?.active || 0} active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList>
              <TabsTrigger value="activity">Activity Types</TabsTrigger>
              <TabsTrigger value="contact">Contact Types</TabsTrigger>
            </TabsList>

            {/* Activity Types Tab */}
            <TabsContent value="activity" className="space-y-4">
              {/* Activity Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search activity types..."
                    value={activitySearchQuery}
                    onChange={(e) => setActivitySearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={activityStatusFilter}
                  onValueChange={setActivityStatusFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Activity Types Table */}
              {activityTypesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : activityTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No activity types found</p>
                  <p className="text-sm">
                    Add your first activity type to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Icon</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activityTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {type.description || "-"}
                        </TableCell>
                        <TableCell>
                          {type.icon ? (
                            <Badge variant="outline">{type.icon}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={type.is_active ? "default" : "secondary"}
                          >
                            {type.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(type.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedActivity(type);
                                setEditActivityDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedActivity(type);
                                setDeleteActivityDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Contact Types Tab */}
            <TabsContent value="contact" className="space-y-4">
              {/* Contact Filters */}
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search contact types..."
                    value={contactSearchQuery}
                    onChange={(e) => setContactSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={contactStatusFilter}
                  onValueChange={setContactStatusFilter}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Contact Types Table */}
              {contactTypesLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : contactTypes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Tag className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No contact types found</p>
                  <p className="text-sm">
                    Add your first contact type to get started
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Type Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contactTypes.map((type) => (
                      <TableRow key={type.id}>
                        <TableCell className="font-medium">
                          {type.name}
                        </TableCell>
                        <TableCell className="max-w-md truncate">
                          {type.description || "-"}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={type.is_active ? "default" : "secondary"}
                          >
                            {type.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(type.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedContact(type);
                                setEditContactDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedContact(type);
                                setDeleteContactDialogOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Activity Type Dialogs */}
      <AddActivityTypeDialog
        open={addActivityDialogOpen}
        onOpenChange={setAddActivityDialogOpen}
      />
      {selectedActivity && (
        <EditActivityTypeDialog
          activityType={selectedActivity}
          open={editActivityDialogOpen}
          onOpenChange={setEditActivityDialogOpen}
        />
      )}
      <AlertDialog
        open={deleteActivityDialogOpen}
        onOpenChange={setDeleteActivityDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the activity type{" "}
              <strong>{selectedActivity?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteActivity}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Contact Type Dialogs */}
      <AddContactTypeDialog
        open={addContactDialogOpen}
        onOpenChange={setAddContactDialogOpen}
      />
      {selectedContact && (
        <EditContactTypeDialog
          contactType={selectedContact}
          open={editContactDialogOpen}
          onOpenChange={setEditContactDialogOpen}
        />
      )}
      <AlertDialog
        open={deleteContactDialogOpen}
        onOpenChange={setDeleteContactDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the contact type{" "}
              <strong>{selectedContact?.name}</strong>. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteContact}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
