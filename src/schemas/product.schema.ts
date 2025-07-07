import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  sku: z.string().min(1, "SKU is required").max(50),
  category: z.string().min(1, "Category is required").max(50),
  price: z.coerce.number().min(0, "Price must be positive"),
  cost: z.coerce.number().min(0, "Cost must be positive"),
  inStock: z.coerce.number().min(0, "Stock must be positive"),
  allocated: z.coerce.number().min(0, "Allocated must be positive"),
  description: z.string().optional(),
});

export type ProductFormData = z.infer<typeof productSchema>;
