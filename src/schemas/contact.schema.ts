import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone is required"),
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  status: z.enum(["active", "lead", "inactive"]),
  notes: z.string().optional(),
});

export type ContactFormData = z.infer<typeof contactSchema>;
