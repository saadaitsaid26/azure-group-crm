import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { contactSchema, ContactFormData } from "@/schemas/contact.schema";
import { useToast } from "@/hooks/use-toast";
import { useOrganizations } from "@/api/organizations";
import { useCreateContact } from "@/api/contacts";
import LoadingSpinner from "@/components/LoadingSpinner";

interface AddContactDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddContactDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddContactDialogProps) {
  const { toast } = useToast();
  const createContactMutation = useCreateContact();

  // Fetch organizations for the dropdown
  const { data: organizationsData, isLoading: isLoadingOrganizations } =
    useOrganizations({
      page_size: 1000, // Get all organizations
      status: "active", // Only show active organizations
    });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      status: "active",
      organization: null,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await createContactMutation.mutateAsync(data);
      toast({ title: "Success", description: "Contact created successfully" });
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to create contact:", error);
      const errorMessage = error?.message || "Failed to create contact";
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
          <DialogTitle>Add New Contact</DialogTitle>
          <DialogDescription>
            Fill out the fields below to create a new contact in the CRM.
            Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name *</Label>
              <Input id="first_name" {...register("first_name")} />
              {errors.first_name && (
                <p className="text-sm text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name *</Label>
              <Input id="last_name" {...register("last_name")} />
              {errors.last_name && (
                <p className="text-sm text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" {...register("email")} />
              {errors.email && (
                <p className="text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" {...register("phone")} />
              {errors.phone && (
                <p className="text-sm text-destructive">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Company</Label>
              {isLoadingOrganizations ? (
                <div className="flex items-center justify-center h-10 border rounded-md">
                  <LoadingSpinner />
                </div>
              ) : (
                <Select
                  onValueChange={(value) =>
                    setValue("organization", value === "none" ? null : value)
                  }
                  value={watch("organization") || "none"}
                >
                  <SelectTrigger id="organization">
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <span className="text-muted-foreground">No company</span>
                    </SelectItem>
                    {organizationsData?.results?.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.organization && (
                <p className="text-sm text-destructive">
                  {errors.organization.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Input id="role" {...register("role")} />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              onValueChange={(value) => setValue("status", value as any)}
              defaultValue="active"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={createContactMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={createContactMutation.isPending}>
              {createContactMutation.isPending
                ? "Creating..."
                : "Create Contact"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
