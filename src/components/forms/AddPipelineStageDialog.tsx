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
import { useCreatePipelineStage } from "@/api/reference";
import { toast } from "@/hooks/use-toast";

const addPipelineStageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sort_order: z.coerce.number().min(0, "Sort order must be 0 or greater"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #3B82F6)")
    .optional()
    .or(z.literal("")),
});

type AddPipelineStageFormValues = z.infer<typeof addPipelineStageSchema>;

interface AddPipelineStageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddPipelineStageDialog({
  open,
  onOpenChange,
}: AddPipelineStageDialogProps) {
  const createStage = useCreatePipelineStage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddPipelineStageFormValues>({
    resolver: zodResolver(addPipelineStageSchema),
    defaultValues: {
      name: "",
      description: "",
      sort_order: 0,
      color: "",
    },
  });

  const onSubmit = async (data: AddPipelineStageFormValues) => {
    setIsSubmitting(true);
    try {
      await createStage.mutateAsync({
        name: data.name,
        description: data.description,
        sort_order: data.sort_order,
        color: data.color || undefined,
      });
      toast({
        title: "Success",
        description: "Pipeline stage created successfully",
      });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to create pipeline stage",
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
          <DialogTitle>Add Pipeline Stage</DialogTitle>
          <DialogDescription>
            Create a new stage for your sales pipeline
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stage Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Qualification" {...field} />
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
                      placeholder="Initial qualification of the lead..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sort_order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sort Order</FormLabel>
                    <FormControl>
                      <Input type="number" min="0" placeholder="0" {...field} />
                    </FormControl>
                    <FormDescription>Display order in pipeline</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <FormControl>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          className="w-16 h-10 p-1 cursor-pointer"
                          {...field}
                        />
                        <Input
                          type="text"
                          placeholder="#3B82F6"
                          className="flex-1"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
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
                Create Stage
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
