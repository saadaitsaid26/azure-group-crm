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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCreateLeadSource } from "@/api/reference";
import { toast } from "@/hooks/use-toast";

const addLeadSourceSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type AddLeadSourceFormValues = z.infer<typeof addLeadSourceSchema>;

interface AddLeadSourceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddLeadSourceDialog({
  open,
  onOpenChange,
}: AddLeadSourceDialogProps) {
  const createSource = useCreateLeadSource();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddLeadSourceFormValues>({
    resolver: zodResolver(addLeadSourceSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const onSubmit = async (data: AddLeadSourceFormValues) => {
    setIsSubmitting(true);
    try {
      await createSource.mutateAsync({
        name: data.name,
        description: data.description,
      });
      toast({
        title: "Success",
        description: "Lead source created successfully",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create lead source",
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
          <DialogTitle>Add Lead Source</DialogTitle>
          <DialogDescription>
            Create a new lead source or channel
          </DialogDescription>
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
                Create Source
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
