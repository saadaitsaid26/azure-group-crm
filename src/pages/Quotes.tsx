import { useState } from "react";
import {
  Plus,
  Search,
  FileText,
  Edit,
  Trash2,
  Eye,
  Loader2,
} from "lucide-react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuotes, useQuoteStats, useDeleteQuote } from "@/api/quotes";
import { useToast } from "@/hooks/use-toast";
import AddQuoteDialog from "@/components/forms/AddQuoteDialog";
import EditQuoteDialog from "@/components/forms/EditQuoteDialog";
import type { QuoteListItem } from "@/schemas/quote.schema";

export default function Quotes() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "draft" | "sent" | "accepted" | "rejected" | "expired" | "all"
  >("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState<QuoteListItem | null>(
    null
  );

  // Build filters
  const filters = {
    q: searchQuery || undefined,
    status: statusFilter === "all" ? undefined : statusFilter,
  };

  // Fetch data
  const { data: quotesData, isLoading: quotesLoading } = useQuotes(filters);
  const { data: stats, isLoading: statsLoading } = useQuoteStats(filters);
  const deleteQuoteMutation = useDeleteQuote();

  const quotes = quotesData?.results || [];

  const handleEdit = (quote: QuoteListItem) => {
    setSelectedQuote(quote);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (quote: QuoteListItem) => {
    setSelectedQuote(quote);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedQuote) return;

    try {
      await deleteQuoteMutation.mutateAsync(selectedQuote.id);
      toast({
        title: "Success",
        description: "Quote deleted successfully",
      });
      setDeleteDialogOpen(false);
      setSelectedQuote(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete quote",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(parseFloat(value));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "draft":
        return "secondary";
      case "sent":
        return "default";
      case "accepted":
        return "default";
      case "rejected":
        return "destructive";
      case "expired":
        return "secondary";
      default:
        return "default";
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quotes</h1>
          <p className="text-muted-foreground">
            Manage sales quotations and pricing
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Quote
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Quotes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-gray-600">
                {stats?.by_status.draft || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Accepted
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold text-green-600">
                {stats?.by_status.accepted || 0}
              </div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <div className="text-2xl font-bold">
                {formatCurrency(stats?.total_value?.toString() || "0")}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search quotes by number, organization, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value: any) => setStatusFilter(value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="accepted">Accepted</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quotes Table */}
      <Card>
        <CardContent className="pt-6">
          {quotesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : quotes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No quotes found</p>
              <p className="text-sm">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters"
                  : "Create your first quote to get started"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Quote #</TableHead>
                  <TableHead>Organization</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expiry</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {quotes.map((quote) => (
                  <TableRow key={quote.id}>
                    <TableCell className="font-mono text-sm">
                      {quote.quote_number}
                    </TableCell>
                    <TableCell className="font-medium">
                      {quote.organization_name}
                    </TableCell>
                    <TableCell>{quote.contact_name || "-"}</TableCell>
                    <TableCell>{formatDate(quote.created_at)}</TableCell>
                    <TableCell>{formatDate(quote.expiry_date)}</TableCell>
                    <TableCell>{quote.items_count}</TableCell>
                    <TableCell className="font-semibold">
                      {formatCurrency(quote.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(quote)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(quote)}
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
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddQuoteDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onSuccess={() => {
          setAddDialogOpen(false);
        }}
      />

      {selectedQuote && (
        <EditQuoteDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          quoteId={selectedQuote.id}
          onSuccess={() => {
            setEditDialogOpen(false);
            setSelectedQuote(null);
          }}
        />
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Quote</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete quote "
              {selectedQuote?.quote_number}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedQuote(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
