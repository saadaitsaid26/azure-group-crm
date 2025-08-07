import { z } from "zod";

/**
 * Quote item schema for form validation
 */
export const quoteItemSchema = z.object({
  product: z.string().uuid("Invalid product"),
  description: z.string().optional(),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than zero"),
  unit_price: z.coerce.number().min(0, "Unit price cannot be negative"),
  sort_order: z.number().optional().default(0),
});

export type QuoteItemFormData = z.infer<typeof quoteItemSchema>;

/**
 * Quote schema for form validation (aligned with backend)
 */
export const quoteSchema = z.object({
  quote_number: z.string().min(1, "Quote number is required").max(50, "Quote number must be 50 characters or less"),
  organization: z.string().uuid("Organization is required"),
  contact: z.string().uuid().optional().nullable(),
  lead: z.string().uuid().optional().nullable(),
  status: z.enum(["draft", "sent", "accepted", "rejected", "expired"]).default("draft"),
  subtotal: z.coerce.number().min(0, "Subtotal cannot be negative"),
  tax_rate: z.coerce.number().min(0, "Tax rate cannot be negative").default(0),
  tax_amount: z.coerce.number().min(0, "Tax amount cannot be negative"),
  discount_amount: z.coerce.number().min(0, "Discount cannot be negative").default(0),
  total: z.coerce.number().min(0, "Total cannot be negative"),
  expiry_date: z.string().optional().nullable(),
  notes: z.string().optional(),
  terms: z.string().optional(),
  items: z.array(quoteItemSchema).optional().default([]),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

/**
 * Quote item API response interface
 */
export interface QuoteItem {
  id: string;
  quote: string;
  product: string;
  product_name: string;
  product_sku: string;
  description: string;
  quantity: string;
  unit_price: string;
  line_total: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

/**
 * Quote API response interface
 */
export interface Quote {
  id: string;
  quote_number: string;
  organization: string;
  organization_name: string;
  contact: string | null;
  contact_name: string | null;
  lead: string | null;
  lead_title: string | null;
  created_by: string | null;
  created_by_email: string | null;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  subtotal: string;
  tax_rate: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  expiry_date: string | null;
  notes: string;
  terms: string;
  items: QuoteItem[];
  created_at: string;
  updated_at: string;
}

/**
 * Quote list response interface (lighter version without items)
 */
export interface QuoteListItem {
  id: string;
  quote_number: string;
  organization: string;
  organization_name: string;
  contact: string | null;
  contact_name: string | null;
  created_by_email: string | null;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  subtotal: string;
  tax_amount: string;
  discount_amount: string;
  total: string;
  expiry_date: string | null;
  items_count: number;
  created_at: string;
  updated_at: string;
}

/**
 * Quote stats interface
 */
export interface QuoteStats {
  total: number;
  by_status: {
    draft: number;
    sent: number;
    accepted: number;
    rejected: number;
    expired: number;
  };
  total_value: number;
  average_value: number;
}

