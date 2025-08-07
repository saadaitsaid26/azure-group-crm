import { z } from "zod";

export const contactSchema = z.object({
  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional().default(""),
  organization: z.string().optional().nullable().transform(val => {
    if (!val || val === "none") return null;
    return val;
  }).refine(
    (val) => !val || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val),
    { message: "Invalid organization" }
  ),
  role: z.string().optional().default(""),
  status: z.enum(["active", "lead", "inactive"]).default("active"),
  notes: z.string().optional().default(""),
});

export type ContactFormData = z.infer<typeof contactSchema>;
