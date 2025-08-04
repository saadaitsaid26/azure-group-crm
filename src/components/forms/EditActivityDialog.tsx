import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityFormSchema, type ActivityFormData, type Activity } from "@/schemas/activity.schema";
import { useUpdateActivity } from "@/api/activities";
import { useLeads } from "@/api/leads";
import { useContacts } from "@/api/contacts";
import { useOrganizations } from "@/api/organizations";
import { useToast } from "@/hooks/use-toast";

interface EditActivityDialogProps {
  activity: Activity | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditActivityDialog({ activity, open, onOpenChange, onSuccess }: EditActivityDialogProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateActivity();
  
  const { data: leadsData } = useLeads({ page_size: 100 });
  const { data: contactsData } = useContacts({ page_size: 100 });
  const { data: organizationsData } = useOrganizations({ page_size: 100 });

  const leads = leadsData?.results || [];
  const contacts = contactsData?.results || [];
  const organizations = organizationsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
  });

  // Reset form when activity changes
  useEffect(() => {
    if (activity && open) {
      reset({
        title: activity.title || '',
        type: activity.type,
        lead: activity.lead || 'none',
        contact: activity.contact || 'none',
        organization: activity.organization || 'none',
        schedule_from: activity.schedule_from ? activity.schedule_from.slice(0, 16) : '',
        schedule_to: activity.schedule_to ? activity.schedule_to.slice(0, 16) : '',
        comment: activity.comment || '',
      });
    }
  }, [activity, open, reset]);

  const onSubmit = async (data: ActivityFormData) => {
    if (!activity) return;

    try {
      await updateMutation.mutateAsync({
        id: activity.id,
        data: {
          ...data,
          // Convert empty strings and "none" to null for optional fields
          title: data.title || null,
          lead: data.lead === 'none' ? null : data.lead || null,
          contact: data.contact === 'none' ? null : data.contact || null,
          organization: data.organization === 'none' ? null : data.organization || null,
          schedule_from: data.schedule_from || null,
          schedule_to: data.schedule_to || null,
          comment: data.comment || null,
        },
      });

      toast({
        title: "Success",
        description: "Activity updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update activity",
        variant: "destructive",
      });
    }
  };

  const activityType = watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Activity</DialogTitle>
          <DialogDescription>
            Modify the activity details. Fields left blank will remain unchanged.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="type">Type *</Label>
              <Select
                value={activityType}
                onValueChange={(value) => setValue("type", value as any)}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="note">Note</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500 mt-1">{errors.type.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Activity title"
              />
            </div>

            <div>
              <Label htmlFor="lead">Lead</Label>
              <Select
                value={watch("lead") || "none"}
                onValueChange={(value) => setValue("lead", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="contact">Contact</Label>
              <Select
                value={watch("contact") || "none"}
                onValueChange={(value) => setValue("contact", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                value={watch("organization") || "none"}
                onValueChange={(value) => setValue("organization", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="schedule_from">Schedule From</Label>
              <Input
                id="schedule_from"
                type="datetime-local"
                {...register("schedule_from")}
                className={errors.schedule_from ? "border-red-500" : ""}
              />
              {errors.schedule_from && (
                <p className="text-sm text-red-500 mt-1">{errors.schedule_from.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="schedule_to">Schedule To</Label>
              <Input
                id="schedule_to"
                type="datetime-local"
                {...register("schedule_to")}
                className={errors.schedule_to ? "border-red-500" : ""}
              />
              {errors.schedule_to && (
                <p className="text-sm text-red-500 mt-1">{errors.schedule_to.message}</p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="comment">Comment</Label>
              <Textarea
                id="comment"
                {...register("comment")}
                placeholder="Additional details..."
                rows={4}
              />
            </div>
          </div>

          {errors.root && (
            <p className="text-sm text-red-500">{errors.root.message}</p>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
