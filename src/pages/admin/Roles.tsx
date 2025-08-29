import { useState } from "react";
import {
  useGroups,
  useGroupStats,
  useCreateGroup,
  useUpdateGroup,
  useDeleteGroup,
  usePermissionsByContentType,
  Group,
  GroupFormData,
} from "@/api/groups";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  Shield,
  Loader2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminRoles() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [deletingGroupId, setDeletingGroupId] = useState<number | null>(null);

  const { toast } = useToast();

  // Fetch data
  const { data: groupsData, isLoading: groupsLoading } = useGroups({
    q: searchQuery,
  });
  const { data: stats } = useGroupStats();
  const { data: permissionsByType } = usePermissionsByContentType();

  // Mutations
  const createGroupMutation = useCreateGroup();
  const updateGroupMutation = useUpdateGroup();
  const deleteGroupMutation = useDeleteGroup();

  const groups = groupsData?.results || [];

  const handleCreateGroup = async (data: GroupFormData) => {
    try {
      await createGroupMutation.mutateAsync(data);
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Role created successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create role",
        variant: "destructive",
      });
    }
  };

  const handleUpdateGroup = async (
    id: number,
    data: Partial<GroupFormData>
  ) => {
    try {
      await updateGroupMutation.mutateAsync({ id, data });
      setEditingGroup(null);
      toast({
        title: "Success",
        description: "Role updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update role",
        variant: "destructive",
      });
    }
  };

  const handleDeleteGroup = async (id: number) => {
    try {
      await deleteGroupMutation.mutateAsync(id);
      setDeletingGroupId(null);
      toast({
        title: "Success",
        description: "Role deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Roles & Permissions</h1>
        <p className="text-muted-foreground">
          Manage system roles and assign permissions
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.with_users}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Empty Roles</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.empty}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Users in Roles
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_users}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search and Actions */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search roles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          </DialogTrigger>
          <GroupDialog
            onSubmit={handleCreateGroup}
            permissionsByType={permissionsByType || []}
            isLoading={createGroupMutation.isPending}
          />
        </Dialog>
      </div>

      {/* Groups List */}
      {groupsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
          <Shield className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-2">No roles found</p>
          <p className="text-sm text-muted-foreground mb-4">
            {searchQuery
              ? "Try adjusting your search"
              : "Get started by creating a new role"}
          </p>
          {!searchQuery && (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Role
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">
                        {group.user_count} user
                        {group.user_count !== 1 ? "s" : ""}
                      </Badge>
                      <Badge variant="outline">
                        {group.permission_count} permission
                        {group.permission_count !== 1 ? "s" : ""}
                      </Badge>
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingGroup(group as any)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingGroupId(group.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {editingGroup && (
        <Dialog
          open={!!editingGroup}
          onOpenChange={() => setEditingGroup(null)}
        >
          <GroupDialog
            group={editingGroup}
            onSubmit={(data) => handleUpdateGroup(editingGroup.id, data)}
            permissionsByType={permissionsByType || []}
            isLoading={updateGroupMutation.isPending}
          />
        </Dialog>
      )}

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingGroupId}
        onOpenChange={() => setDeletingGroupId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this role. Users in this role will
              lose their associated permissions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                deletingGroupId && handleDeleteGroup(deletingGroupId)
              }
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

// Group Dialog Component
interface GroupDialogProps {
  group?: Group;
  onSubmit: (data: GroupFormData) => void;
  permissionsByType: Array<{
    content_type: { id: number; app_label: string; model: string };
    permissions: Array<{ id: number; name: string; codename: string }>;
  }>;
  isLoading?: boolean;
}

function GroupDialog({
  group,
  onSubmit,
  permissionsByType,
  isLoading,
}: GroupDialogProps) {
  const [name, setName] = useState(group?.name || "");
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    group?.permissions.map((p) => p.id) || []
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      permission_ids: selectedPermissions,
    });
  };

  const togglePermission = (permissionId: number) => {
    setSelectedPermissions((prev) =>
      prev.includes(permissionId)
        ? prev.filter((id) => id !== permissionId)
        : [...prev, permissionId]
    );
  };

  return (
    <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{group ? "Edit Role" : "Create Role"}</DialogTitle>
        <DialogDescription>
          {group
            ? "Update role details and permissions"
            : "Create a new role with permissions"}
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Role Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter role name"
            required
          />
        </div>

        <div className="space-y-4">
          <Label>Permissions</Label>
          <div className="space-y-4 border rounded-lg p-4 max-h-96 overflow-y-auto">
            {permissionsByType.map((group) => (
              <div
                key={`${group.content_type.app_label}.${group.content_type.model}`}
                className="space-y-2"
              >
                <h4 className="font-medium text-sm">
                  {group.content_type.app_label}.{group.content_type.model}
                </h4>
                <div className="grid grid-cols-2 gap-2 pl-4">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id={`perm-${permission.id}`}
                        checked={selectedPermissions.includes(permission.id)}
                        onCheckedChange={() => togglePermission(permission.id)}
                      />
                      <label
                        htmlFor={`perm-${permission.id}`}
                        className="text-sm font-normal cursor-pointer"
                      >
                        {permission.codename}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {group ? "Update" : "Create"} Role
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
