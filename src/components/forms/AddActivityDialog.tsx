import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  activityFormSchema,
  ActivityFormData,
} from "@/schemas/activity.schema";
import { useToast } from "@/hooks/use-toast";
import { useCreateActivity } from "@/api/activities";
import { useLeads } from "@/api/leads";
import { useContacts } from "@/api/contacts";
import { useOrganizations } from "@/api/organizations";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddActivityDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddActivityDialogProps) {
  const { toast } = useToast();
  const createActivity = useCreateActivity();
  const { data: leads } = useLeads();
  const { data: contacts } = useContacts();
  const { data: organizations } = useOrganizations();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ActivityFormData>({
    resolver: zodResolver(activityFormSchema),
    defaultValues: {
      type: "task",
      is_done: false,
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    try {
      // Convert "none" values to null for optional fields
      const submitData = {
        ...data,
        lead: data.lead === "none" || !data.lead ? null : data.lead,
        contact: data.contact === "none" || !data.contact ? null : data.contact,
        organization:
          data.organization === "none" || !data.organization
            ? null
            : data.organization,
      };
      await createActivity.mutateAsync(submitData);
      toast({ title: "Success", description: "Activity created successfully" });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error("Activity creation error:", error);
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        "Failed to create activity";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
          <DialogDescription>
            Create a new activity and optionally link it to a lead, contact, or
            organization.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {Object.keys(errors).length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-3">
              <p className="text-sm text-destructive font-medium">
                Please fix the following errors:
              </p>
              <ul className="list-disc list-inside text-sm text-destructive mt-1">
                {errors.lead && <li>{errors.lead.message}</li>}
                {errors.contact && <li>{errors.contact.message}</li>}
                {errors.organization && <li>{errors.organization.message}</li>}
                {errors.title && <li>{errors.title.message}</li>}
                {errors.type && <li>{errors.type.message}</li>}
                {errors.schedule_from && (
                  <li>{errors.schedule_from.message}</li>
                )}
                {errors.schedule_to && <li>{errors.schedule_to.message}</li>}
              </ul>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Activity title"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select
              onValueChange={(value) => setValue("type", value as any)}
              defaultValue="task"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="lead">Lead</Label>
              <Select
                onValueChange={(value) => setValue("lead", value)}
                value={watch("lead") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leads?.results?.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.lead && (
                <p className="text-sm text-destructive">
                  {errors.lead.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Select
                onValueChange={(value) => setValue("contact", value)}
                value={watch("contact") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts?.results?.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.first_name} {contact.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.contact && (
                <p className="text-sm text-destructive">
                  {errors.contact.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                onValueChange={(value) => setValue("organization", value)}
                value={watch("organization") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {organizations?.results?.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization && (
                <p className="text-sm text-destructive">
                  {errors.organization.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="schedule_from">Start Date</Label>
              <Input
                id="schedule_from"
                type="datetime-local"
                {...register("schedule_from")}
              />
              {errors.schedule_from && (
                <p className="text-sm text-destructive">
                  {errors.schedule_from.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="schedule_to">End Date</Label>
              <Input
                id="schedule_to"
                type="datetime-local"
                {...register("schedule_to")}
              />
              {errors.schedule_to && (
                <p className="text-sm text-destructive">
                  {errors.schedule_to.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea
              id="comment"
              {...register("comment")}
              rows={3}
              placeholder="Add any notes or comments..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={createActivity.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createActivity.isPending}>
              {createActivity.isPending ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
