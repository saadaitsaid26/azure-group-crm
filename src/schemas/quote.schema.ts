import { z } from "zod";

export const quoteSchema = z.object({
  quoteNumber: z.string().min(1, "Quote number is required").max(50),
  clientName: z.string().min(1, "Client name is required").max(100),
  clientEmail: z.string().email("Invalid email address"),
  subtotal: z.coerce.number().min(0, "Subtotal must be positive"),
  tax: z.coerce.number().min(0, "Tax must be positive"),
  discount: z.coerce.number().min(0, "Discount must be positive"),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.enum(["draft", "sent", "accepted", "rejected"]),
  notes: z.string().optional(),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;
