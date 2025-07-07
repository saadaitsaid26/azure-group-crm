import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { quoteSchema, QuoteFormData } from "@/schemas/quote.schema";
import { useToast } from "@/hooks/use-toast";

interface AddQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AddQuoteDialog({ open, onOpenChange, onSuccess }: AddQuoteDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: "draft",
    },
  });

  const onSubmit = async (data: QuoteFormData) => {
    setLoading(true);
    try {
      // API call will be here
      console.log("Create quote:", data);
      toast({ title: "Success", description: "Quote created successfully" });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create quote", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Quote</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quoteNumber">Quote Number *</Label>
              <Input id="quoteNumber" {...register("quoteNumber")} />
              {errors.quoteNumber && <p className="text-sm text-destructive">{errors.quoteNumber.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select onValueChange={(value) => setValue("status", value as any)} defaultValue="draft">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input id="clientName" {...register("clientName")} />
              {errors.clientName && <p className="text-sm text-destructive">{errors.clientName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientEmail">Client Email *</Label>
              <Input id="clientEmail" type="email" {...register("clientEmail")} />
              {errors.clientEmail && <p className="text-sm text-destructive">{errors.clientEmail.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subtotal">Subtotal *</Label>
              <Input id="subtotal" type="number" step="0.01" {...register("subtotal")} />
              {errors.subtotal && <p className="text-sm text-destructive">{errors.subtotal.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax">Tax *</Label>
              <Input id="tax" type="number" step="0.01" {...register("tax")} />
              {errors.tax && <p className="text-sm text-destructive">{errors.tax.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount *</Label>
              <Input id="discount" type="number" step="0.01" {...register("discount")} />
              {errors.discount && <p className="text-sm text-destructive">{errors.discount.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiryDate">Expiry Date *</Label>
            <Input id="expiryDate" type="date" {...register("expiryDate")} />
            {errors.expiryDate && <p className="text-sm text-destructive">{errors.expiryDate.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" {...register("notes")} rows={3} />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Quote"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
