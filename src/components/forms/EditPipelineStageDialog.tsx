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
import { useUpdatePipelineStage } from "@/api/reference";
import { toast } from "@/hooks/use-toast";
import type { PipelineStage } from "@/api/reference";

const editPipelineStageSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  sort_order: z.coerce.number().min(0, "Sort order must be 0 or greater"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (e.g., #3B82F6)")
    .optional()
    .or(z.literal("")),
  is_active: z.boolean(),
});

type EditPipelineStageFormValues = z.infer<typeof editPipelineStageSchema>;

interface EditPipelineStageDialogProps {
  stage: PipelineStage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditPipelineStageDialog({
  stage,
  open,
  onOpenChange,
}: EditPipelineStageDialogProps) {
  const updateStage = useUpdatePipelineStage();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EditPipelineStageFormValues>({
    resolver: zodResolver(editPipelineStageSchema),
    defaultValues: {
      name: stage.name,
      description: stage.description || "",
      sort_order: stage.sort_order,
      color: stage.color || "",
      is_active: stage.is_active,
    },
  });

  // Update form when stage changes
  useEffect(() => {
    form.reset({
      name: stage.name,
      description: stage.description || "",
      sort_order: stage.sort_order,
      color: stage.color || "",
      is_active: stage.is_active,
    });
  }, [stage, form]);

  const onSubmit = async (data: EditPipelineStageFormValues) => {
    setIsSubmitting(true);
    try {
      await updateStage.mutateAsync({
        id: stage.id,
        data: {
          name: data.name,
          description: data.description,
          sort_order: data.sort_order,
          color: data.color || undefined,
          is_active: data.is_active,
        },
      });
      toast({
        title: "Success",
        description: "Pipeline stage updated successfully",
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to update pipeline stage",
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
          <DialogTitle>Edit Pipeline Stage</DialogTitle>
          <DialogDescription>
            Update pipeline stage information
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
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active Status</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      Stage is available for selection when active
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
