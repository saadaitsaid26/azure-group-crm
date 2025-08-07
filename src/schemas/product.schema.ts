import { z } from "zod";

/**
 * Product schema for form validation (aligned with backend)
 */
export const productSchema = z.object({
  sku: z.string().min(1, "SKU is required").max(50, "SKU must be 50 characters or less"),
  name: z.string().min(1, "Name is required").max(200, "Name must be 200 characters or less"),
  description: z.string().optional(),
  category: z.string().optional(),
  price: z.coerce.number().min(0, "Price cannot be negative"),
  cost: z.coerce.number().min(0, "Cost cannot be negative").optional().default(0),
  status: z.enum(["active", "inactive"]).default("active"),
  metadata: z.record(z.any()).optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;

/**
 * Product API response interface
 */
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  category: string;
  price: string;
  cost: string;
  status: "active" | "inactive";
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

/**
 * Product stats interface
 */
export interface ProductStats {
  total: number;
  active: number;
  inactive: number;
  by_category: Array<{
    category: string;
    count: number;
  }>;
}

