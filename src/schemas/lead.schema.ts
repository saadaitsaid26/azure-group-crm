import { z } from "zod";

export const leadSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  company: z.string().min(1, "Company is required").max(100),
  contactName: z.string().min(1, "Contact name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  value: z.coerce.number().min(0, "Value must be positive"),
  priority: z.enum(["high", "medium", "low"]),
  stage: z.enum(["new", "followUp", "prospect", "negotiation", "won", "lost"]),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;
