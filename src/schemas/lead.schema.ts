import { z } from "zod";

// Lead schema for forms (creating/updating)
export const leadFormSchema = z.object({
  organization: z.string().uuid().optional().nullable(),
  contact: z.string().uuid().optional().nullable(),
  owner: z.string().uuid().optional().nullable(),
  title: z.string().min(1, "Title is required").max(200),
  value: z.coerce.number().min(0, "Value must be non-negative").optional().nullable(),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  stage: z.enum(["new", "followUp", "prospect", "negotiation", "won", "lost"]).default("new"),
  source: z.string().max(100).optional(),
  notes: z.string().optional(),
});

export type LeadFormData = z.infer<typeof leadFormSchema>;

// Lead type from API (includes read-only fields)
export interface Lead {
  id: string;
  organization: string | null;
  organization_name: string | null;
  contact: string | null;
  contact_name: string | null;
  owner: string | null;
  owner_name: string | null;
  title: string;
  value: string | null;
  priority: "high" | "medium" | "low";
  stage: "new" | "followUp" | "prospect" | "negotiation" | "won" | "lost";
  source: string;
  notes: string;
  activities_count: number;
  created_at: string;
  updated_at: string;
}

// For backward compatibility
export const leadSchema = leadFormSchema;

