import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Mail,
  Phone,
  Building,
  User,
  Edit,
  Trash2,
} from "lucide-react";
import AddContactDialog from "@/components/forms/AddContactDialog";
import EditContactDialog from "@/components/forms/EditContactDialog";
import {
  useContacts,
  useContactStats,
  useDeleteContact,
  type Contact,
} from "@/api/contacts";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/hooks/use-toast";

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "lead":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export default function Contacts() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const {
    data: contactsData,
    isLoading,
    error,
  } = useContacts({
    q: searchQuery || undefined,
    status: statusFilter || undefined,
  });

  const { data: stats } = useContactStats();
  const deleteMutation = useDeleteContact();

  const contacts = contactsData?.results || [];

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;

    try {
      await deleteMutation.mutateAsync(id);
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to delete contact",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-red-600">
              Error loading contacts. Please try again.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Contacts</h1>
          <p className="text-muted-foreground">
            Manage your business contacts and relationships
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Button
            className="bg-gradient-primary hover:opacity-90"
            onClick={(e) => {
              (e.currentTarget as HTMLButtonElement).blur();
              setDialogOpen(true);
            }}
          >
            Add Contact
          </Button>
        </div>
      </div>

      <AddContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
      />

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search contacts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-border rounded-md text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="lead">Lead</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.total || 0}
                </p>
                <p className="text-sm text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.by_status?.active || 0}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.by_status?.lead || 0}
                </p>
                <p className="text-sm text-muted-foreground">Leads</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {stats?.by_status?.inactive || 0}
                </p>
                <p className="text-sm text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts Grid */}
      {contacts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {contacts.map((contact) => (
            <Card
              key={contact.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                      {contact.first_name?.[0]}
                      {contact.last_name?.[0]}
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {contact.full_name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {contact.role || "Contact"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => handleEditContact(contact)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 p-0 text-red-600 hover:text-red-700"
                      onClick={() =>
                        handleDelete(contact.id, contact.full_name)
                      }
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  {contact.organization_name && (
                    <div className="flex items-center gap-2 text-sm">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-foreground">
                        {contact.organization_name}
                      </span>
                    </div>
                  )}
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground truncate">
                        {contact.email}
                      </span>
                    </div>
                  )}
                  {contact.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {contact.phone}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <Badge className={getStatusColor(contact.status)}>
                    {contact.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={User}
          title="No contacts found"
          description={
            searchQuery
              ? "Try adjusting your search criteria"
              : "Get started by adding your first contact"
          }
          actionLabel="Add Contact"
          onAction={() => setDialogOpen(true)}
        />
      )}

      <AddContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={() => setDialogOpen(false)}
      />
      <EditContactDialog
        contact={editingContact}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSuccess={() => setEditDialogOpen(false)}
      />
    </div>
  );
}
