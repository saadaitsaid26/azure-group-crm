import { z } from "zod";

export const organizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  industry: z.string().optional().default(""),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  phone: z.string().optional().default(""),
  email: z.string().email("Invalid email address"),
  address: z.string().optional().default(""),
  notes: z.string().optional().default(""),
  status: z.enum(["active", "prospect", "inactive"]).default("active"),
  type: z.enum(["Enterprise", "Mid-Market", "SMB", ""]).optional().default(""),
});

export type OrganizationFormData = z.infer<typeof organizationSchema>;
