/**
 * Export utilities for DataTable
 */

/**
 * Convert table data to CSV format
 */
export function exportToCSV<TData>(
  data: TData[],
  columns: {
    accessorKey: string;
    header: string;
  }[],
  filename: string = "export.csv"
) {
  // Create CSV header
  const headers = columns.map((col) => col.header).join(",");

  // Create CSV rows
  const rows = data.map((row) =>
    columns
      .map((col) => {
        const value = (row as any)[col.accessorKey];
        // Handle values that might contain commas or quotes
        if (value === null || value === undefined) {
          return "";
        }
        const stringValue = String(value);
        if (stringValue.includes(",") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
      .join(",")
  );

  // Combine headers and rows
  const csv = [headers, ...rows].join("\n");

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date for export
 */
export function formatDateForExport(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Format currency for export
 */
export function formatCurrencyForExport(value: number | null | undefined): string {
  if (value === null || value === undefined) return "";
  return value.toFixed(2);
}
