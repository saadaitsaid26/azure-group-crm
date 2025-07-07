import { z } from "zod";

export const activitySchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  type: z.enum(["call", "email", "meeting", "task", "note"]),
  leadId: z.string().optional(),
  contactId: z.string().optional(),
  scheduleFrom: z.string().min(1, "Start date is required"),
  scheduleTo: z.string().min(1, "End date is required"),
  comment: z.string().optional(),
  isDone: z.boolean().default(false),
});

export type ActivityFormData = z.infer<typeof activitySchema>;
