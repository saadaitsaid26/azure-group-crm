import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useUpdateContactType } from "@/api/reference";
import { toast } from "@/hooks/use-toast";
import type { ContactType } from "@/api/reference";

const editContactTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type EditContactTypeFormValues = z.infer<typeof editContactTypeSchema>;

interface EditContactTypeDialogProps {
  contactType: ContactType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditContactTypeDialog({
  contactType,
  open,
  onOpenChange,
}: EditContactTypeDialogProps) {
  const updateContactType = useUpdateContactType();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditContactTypeFormValues>({
    resolver: zodResolver(editContactTypeSchema),
    defaultValues: {
      name: contactType.name,
      description: contactType.description || "",
      is_active: contactType.is_active,
    },
  });

  // Update form when contactType changes
  useEffect(() => {
    form.reset({
      name: contactType.name,
      description: contactType.description || "",
      is_active: contactType.is_active,
    });
  }, [contactType, form]);

  const onSubmit = async (data: EditContactTypeFormValues) => {
    setIsSubmitting(true);
    try {
      await updateContactType.mutateAsync({
        id: contactType.id,
        data: {
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        },
      });
      toast({
        title: "Success",
        description: "Contact type updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update contact type",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Contact Type</DialogTitle>
          <DialogDescription>Update contact type information</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Customer, Partner, Vendor..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this contact type..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Type is available for selection when active
                    </div>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
