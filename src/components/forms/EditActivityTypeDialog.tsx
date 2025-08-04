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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { useUpdateActivityType } from "@/api/reference";
import { toast } from "@/hooks/use-toast";
import type { ActivityType } from "@/api/reference";

const editActivityTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
  is_active: z.boolean(),
});

type EditActivityTypeFormValues = z.infer<typeof editActivityTypeSchema>;

interface EditActivityTypeDialogProps {
  activityType: ActivityType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditActivityTypeDialog({
  activityType,
  open,
  onOpenChange,
}: EditActivityTypeDialogProps) {
  const updateActivityType = useUpdateActivityType();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditActivityTypeFormValues>({
    resolver: zodResolver(editActivityTypeSchema),
    defaultValues: {
      name: activityType.name,
      description: activityType.description || "",
      icon: activityType.icon || "",
      is_active: activityType.is_active,
    },
  });

  // Update form when activityType changes
  useEffect(() => {
    form.reset({
      name: activityType.name,
      description: activityType.description || "",
      icon: activityType.icon || "",
      is_active: activityType.is_active,
    });
  }, [activityType, form]);

  const onSubmit = async (data: EditActivityTypeFormValues) => {
    setIsSubmitting(true);
    try {
      await updateActivityType.mutateAsync({
        id: activityType.id,
        data: {
          name: data.name,
          description: data.description,
          icon: data.icon,
          is_active: data.is_active,
        },
      });
      toast({
        title: "Success",
        description: "Activity type updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update activity type",
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
          <DialogTitle>Edit Activity Type</DialogTitle>
          <DialogDescription>
            Update activity type information
          </DialogDescription>
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
                    <Input placeholder="Call, Email, Meeting..." {...field} />
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
                      placeholder="Describe this activity type..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="phone, mail, calendar..." {...field} />
                  </FormControl>
                  <FormDescription>
                    Lucide icon name (e.g., phone, mail, calendar)
                  </FormDescription>
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
