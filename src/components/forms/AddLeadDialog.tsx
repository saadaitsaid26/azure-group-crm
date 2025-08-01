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
import { leadFormSchema, LeadFormData } from "@/schemas/lead.schema";
import { useToast } from "@/hooks/use-toast";
import { useCreateLead } from "@/api/leads";
import { useOrganizations } from "@/api/organizations";
import { useContacts } from "@/api/contacts";

interface AddLeadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddLeadDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddLeadDialogProps) {
  const { toast } = useToast();
  const createLead = useCreateLead();
  const { data: organizations } = useOrganizations();
  const { data: contacts } = useContacts();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      priority: "medium",
      stage: "new",
    },
  });

  const onSubmit = async (data: LeadFormData) => {
    try {
      // Convert "none" values to undefined for optional fields
      const submitData = {
        ...data,
        organization:
          data.organization === "none" ? undefined : data.organization,
        contact: data.contact === "none" ? undefined : data.contact,
      };
      await createLead.mutateAsync(submitData);
      toast({ title: "Success", description: "Lead created successfully" });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.detail || "Failed to create lead";
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
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Provide details for the new lead. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register("title")}
              placeholder="Q4 Enterprise Deal"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization</Label>
              <Select
                onValueChange={(value) =>
                  setValue("organization", value || null)
                }
                value={watch("organization") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {organizations?.results.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Select
                onValueChange={(value) => setValue("contact", value || null)}
                value={watch("contact") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts?.results.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value ($)</Label>
              <Input
                id="value"
                type="number"
                step="0.01"
                {...register("value")}
                placeholder="50000"
              />
              {errors.value && (
                <p className="text-sm text-destructive">
                  {errors.value.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source</Label>
              <Input
                id="source"
                {...register("source")}
                placeholder="Website, Referral, etc."
              />
              {errors.source && (
                <p className="text-sm text-destructive">
                  {errors.source.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority *</Label>
              <Select
                onValueChange={(value) => setValue("priority", value as any)}
                value={watch("priority") || "medium"}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage">Stage *</Label>
              <Select
                onValueChange={(value) => setValue("stage", value as any)}
                value={watch("stage") || "new"}
              >
                <SelectTrigger>
                  <SelectValue />
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              rows={3}
              placeholder="Additional notes about this lead..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={createLead.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createLead.isPending}>
              {createLead.isPending ? "Creating..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
