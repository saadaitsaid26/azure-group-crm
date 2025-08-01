import * as React from "react";
import { X, Download } from "lucide-react";
import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "./DataTableViewOptions";
import { DataTableFacetedFilter } from "./DataTableFacetedFilter";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  searchColumn?: string;
  searchPlaceholder?: string;
  filters?: {
    column: string;
    title: string;
    options: {
      label: string;
      value: string;
      icon?: React.ComponentType<{ className?: string }>;
    }[];
  }[];
  onExport?: () => void;
  children?: React.ReactNode;
}

export function DataTableToolbar<TData>({
  table,
  searchColumn,
  searchPlaceholder = "Search...",
  filters,
  onExport,
  children,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const [searchValue, setSearchValue] = React.useState("");

  // Debounced search with 300ms delay
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchColumn) {
        table.getColumn(searchColumn)?.setFilterValue(searchValue);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchValue, searchColumn, table]);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {searchColumn && (
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="h-8 w-[150px] lg:w-[250px]"
          />
        )}
        {filters?.map((filter) => {
          const column = table.getColumn(filter.column);
          return column ? (
            <DataTableFacetedFilter
              key={filter.column}
              column={column}
              title={filter.title}
              options={filter.options}
            />
          ) : null;
        })}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setSearchValue("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <X className="ml-2 h-4 w-4" />
          </Button>
        )}
        {children}
      </div>
      <div className="flex items-center space-x-2">
        {onExport && (
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="h-8"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        )}
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
