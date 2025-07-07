import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { activitySchema, ActivityFormData } from "@/schemas/activity.schema";
import { useToast } from "@/hooks/use-toast";

interface AddActivityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddActivityDialog({ open, onOpenChange, onSuccess }: AddActivityDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<ActivityFormData>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "task",
      isDone: false,
    },
  });

  const onSubmit = async (data: ActivityFormData) => {
    setLoading(true);
    try {
      // API call will be here
      console.log("Create activity:", data);
      toast({ title: "Success", description: "Activity created successfully" });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create activity", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Activity</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" {...register("title")} />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Type *</Label>
            <Select onValueChange={(value) => setValue("type", value as any)} defaultValue="task">
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="call">Call</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="meeting">Meeting</SelectItem>
                <SelectItem value="task">Task</SelectItem>
                <SelectItem value="note">Note</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduleFrom">Start Date *</Label>
              <Input id="scheduleFrom" type="datetime-local" {...register("scheduleFrom")} />
              {errors.scheduleFrom && <p className="text-sm text-destructive">{errors.scheduleFrom.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="scheduleTo">End Date *</Label>
              <Input id="scheduleTo" type="datetime-local" {...register("scheduleTo")} />
              {errors.scheduleTo && <p className="text-sm text-destructive">{errors.scheduleTo.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment</Label>
            <Textarea id="comment" {...register("comment")} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Activity"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
