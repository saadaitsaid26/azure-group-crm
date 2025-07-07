import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  industry: z.string().min(1, "Industry is required").max(100),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
