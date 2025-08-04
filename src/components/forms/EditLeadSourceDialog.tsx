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
import { useUpdateLeadSource } from "@/api/reference";
import { toast } from "@/hooks/use-toast";
import type { LeadSource } from "@/api/reference";

const editLeadSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  is_active: z.boolean(),
});

type EditLeadSourceFormValues = z.infer<typeof editLeadSourceSchema>;

interface EditLeadSourceDialogProps {
  source: LeadSource;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditLeadSourceDialog({
  source,
  open,
  onOpenChange,
}: EditLeadSourceDialogProps) {
  const updateSource = useUpdateLeadSource();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditLeadSourceFormValues>({
    resolver: zodResolver(editLeadSourceSchema),
    defaultValues: {
      name: source.name,
      description: source.description || "",
      is_active: source.is_active,
    },
  });

  // Update form when source changes
  useEffect(() => {
    form.reset({
      name: source.name,
      description: source.description || "",
      is_active: source.is_active,
    });
  }, [source, form]);

  const onSubmit = async (data: EditLeadSourceFormValues) => {
    setIsSubmitting(true);
    try {
      await updateSource.mutateAsync({
        id: source.id,
        data: {
          name: data.name,
          description: data.description,
          is_active: data.is_active,
        },
      });
      toast({
        title: "Success",
        description: "Lead source updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update lead source",
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
          <DialogTitle>Edit Lead Source</DialogTitle>
          <DialogDescription>Update lead source information</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Website, Referral, Cold Call..."
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
                      placeholder="Describe this lead source..."
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
                      Source is available for selection when active
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
