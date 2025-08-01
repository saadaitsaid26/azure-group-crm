import { useState } from "react";
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
import { Loader2 } from "lucide-react";
import { useCreateActivityType } from "@/api/reference";
import { toast } from "@/hooks/use-toast";

const addActivityTypeSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

type AddActivityTypeFormValues = z.infer<typeof addActivityTypeSchema>;

interface AddActivityTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddActivityTypeDialog({
  open,
  onOpenChange,
}: AddActivityTypeDialogProps) {
  const createActivityType = useCreateActivityType();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddActivityTypeFormValues>({
    resolver: zodResolver(addActivityTypeSchema),
    defaultValues: {
      name: "",
      description: "",
      icon: "",
    },
  });

  const onSubmit = async (data: AddActivityTypeFormValues) => {
    setIsSubmitting(true);
    try {
      await createActivityType.mutateAsync({
        name: data.name,
        description: data.description,
        icon: data.icon,
      });
      toast({
        title: "Success",
        description: "Activity type created successfully",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create activity type",
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
          <DialogTitle>Add Activity Type</DialogTitle>
          <DialogDescription>
            Create a new activity type for tracking interactions
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
                Create Type
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
