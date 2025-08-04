import { ColumnDef } from "@tanstack/react-table";
import { FileText, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTableColumnHeader } from "@/components/data-table/DataTableColumnHeader";
import type { QuoteListItem } from "@/schemas/quote.schema";

// Helper function to format currency
const formatCurrency = (value: string) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(parseFloat(value));
};

// Helper function to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

// Helper function to get status badge variant
const getStatusBadgeVariant = (
  status: string
): "default" | "secondary" | "destructive" | "outline" => {
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

// Helper function to get status color
const getStatusColor = (status: string): string => {
  switch (status) {
    case "draft":
      return "text-gray-600";
    case "sent":
      return "text-blue-600";
    case "accepted":
      return "text-green-600";
    case "rejected":
      return "text-red-600";
    case "expired":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

interface QuoteColumnsProps {
  onEdit: (quote: QuoteListItem) => void;
  onDelete: (quote: QuoteListItem) => void;
}

export const createQuoteColumns = ({
  onEdit,
  onDelete,
}: QuoteColumnsProps): ColumnDef<QuoteListItem>[] => [
  {
    accessorKey: "quote_number",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Quote #" />
    ),
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="font-mono text-sm">
          {row.getValue("quote_number")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "organization_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Organization" />
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("organization_name")}</div>
    ),
  },
  {
    accessorKey: "contact_name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Contact" />
    ),
    cell: ({ row }) => {
      const contactName = row.getValue("contact_name") as string | null;
      return <div>{contactName || "-"}</div>;
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Date" />
    ),
    cell: ({ row }) => {
      const date = row.getValue("created_at") as string;
      return <div className="text-sm">{formatDate(date)}</div>;
    },
  },
  {
    accessorKey: "expiry_date",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Expiry" />
    ),
    cell: ({ row }) => {
      const expiryDate = row.getValue("expiry_date") as string | null;
      return <div className="text-sm">{formatDate(expiryDate)}</div>;
    },
  },
  {
    accessorKey: "items_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Items" />
    ),
    cell: ({ row }) => {
      const itemsCount = row.getValue("items_count") as number;
      return <div className="text-center">{itemsCount}</div>;
    },
  },
  {
    accessorKey: "total",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Total" />
    ),
    cell: ({ row }) => {
      const total = row.getValue("total") as string;
      return <div className="font-semibold">{formatCurrency(total)}</div>;
    },
  },
  {
    accessorKey: "status",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={getStatusBadgeVariant(status)}
          className={getStatusColor(status)}
        >
          {status}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const quote = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(quote)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(quote)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
