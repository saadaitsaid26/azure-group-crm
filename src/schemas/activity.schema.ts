import { z } from "zod";

// Activity schema for forms (creating/updating)
export const activityFormSchema = z.object({
  lead: z.union([z.string().uuid(), z.literal("none"), z.null(), z.undefined()]).optional().nullable(),
  contact: z.union([z.string().uuid(), z.literal("none"), z.null(), z.undefined()]).optional().nullable(),
  organization: z.union([z.string().uuid(), z.literal("none"), z.null(), z.undefined()]).optional().nullable(),
  type: z.enum(["call", "email", "meeting", "task", "note"]),
  title: z.string().max(200).optional(),
  comment: z.string().optional(),
  is_done: z.boolean().default(false),
  schedule_from: z.string().optional().nullable(),
  schedule_to: z.string().optional().nullable(),
}).refine(
  (data) => {
    // At least one entity reference required (excluding "none" values)
    const hasLead = data.lead && data.lead !== "none";
    const hasContact = data.contact && data.contact !== "none";
    const hasOrganization = data.organization && data.organization !== "none";
    return hasLead || hasContact || hasOrganization;
  },
  {
    message: "Activity must be associated with at least one of: lead, contact, or organization",
    path: ["lead"],
  }
);

export type ActivityFormData = z.infer<typeof activityFormSchema>;

// Activity type from API (includes read-only fields)
export interface Activity {
  id: string;
  lead: string | null;
  lead_title: string | null;
  contact: string | null;
  contact_name: string | null;
  organization: string | null;
  organization_name: string | null;
  created_by: string | null;
  created_by_email: string | null;
  type: "call" | "email" | "meeting" | "task" | "note";
  title: string;
  comment: string;
  is_done: boolean;
  schedule_from: string | null;
  schedule_to: string | null;
  created_at: string;
  updated_at: string;
}

// For backward compatibility
export const activitySchema = activityFormSchema;

