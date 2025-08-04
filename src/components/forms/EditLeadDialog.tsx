import { useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  leadFormSchema,
  type LeadFormData,
  type Lead,
} from "@/schemas/lead.schema";
import { useUpdateLead } from "@/api/leads";
import { useOrganizations } from "@/api/organizations";
import { useContacts } from "@/api/contacts";
import { useToast } from "@/hooks/use-toast";

interface EditLeadDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function EditLeadDialog({
  lead,
  open,
  onOpenChange,
  onSuccess,
}: EditLeadDialogProps) {
  const { toast } = useToast();
  const updateMutation = useUpdateLead();

  const { data: organizationsData } = useOrganizations({ page_size: 100 });
  const { data: contactsData } = useContacts({ page_size: 100 });

  const organizations = organizationsData?.results || [];
  const contacts = contactsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      priority: "medium",
      stage: "new",
    },
  });

  // Reset form when lead changes
  useEffect(() => {
    if (lead && open) {
      reset({
        title: lead.title,
        organization: lead.organization || "none",
        contact: lead.contact || "none",
        value: lead.value ? parseFloat(lead.value) : undefined,
        priority: lead.priority,
        stage: lead.stage,
        source: lead.source || "",
        notes: lead.notes || "",
      });
    }
  }, [lead, open, reset]);

  const onSubmit = async (data: LeadFormData) => {
    if (!lead) return;

    try {
      await updateMutation.mutateAsync({
        id: lead.id,
        data: {
          ...data,
          // Convert empty strings and "none" to null for optional fields
          organization:
            data.organization === "none" ? null : data.organization || null,
          contact: data.contact === "none" ? null : data.contact || null,
          value: data.value || null,
          source: data.source || null,
          notes: data.notes || null,
        },
      });

      toast({
        title: "Success",
        description: "Lead updated successfully",
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to update lead",
        variant: "destructive",
      });
    }
  };

  const priority = watch("priority") || "medium";
  const stage = watch("stage") || "new";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Lead</DialogTitle>
          <DialogDescription>
            Update lead details. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Lead title"
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            <div>
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

            <div>
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value", { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.value ? "border-red-500" : ""}
              />
              {errors.value && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.value.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                {...register("source")}
                placeholder="e.g., Website, Referral"
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority *</Label>
              <Select
                value={priority}
                onValueChange={(value) => setValue("priority", value as any)}
              >
                <SelectTrigger
                  className={errors.priority ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              {errors.priority && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.priority.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="stage">Stage *</Label>
              <Select
                value={stage}
                onValueChange={(value) => setValue("stage", value as any)}
              >
                <SelectTrigger className={errors.stage ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="followUp">Follow Up</SelectItem>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="negotiation">Negotiation</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
              {errors.stage && (
                <p className="text-sm text-red-500 mt-1">
                  {errors.stage.message}
                </p>
              )}
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes..."
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isSubmitting}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Updating..." : "Update Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
