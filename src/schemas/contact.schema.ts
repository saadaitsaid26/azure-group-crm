import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional().default(""),
  organization: z.string().uuid().optional().nullable(),
  role: z.string().optional().default(""),
  status: z.enum(["active", "lead", "inactive"]).default("active"),
  notes: z.string().optional().default(""),
});

export type ContactFormData = z.infer<typeof contactSchema>;
