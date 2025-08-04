import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
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
import { Plus, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quoteSchema, QuoteFormData } from "@/schemas/quote.schema";
import { useToast } from "@/hooks/use-toast";
import { useQuote, useUpdateQuote } from "@/api/quotes";
import { useOrganizations } from "@/api/organizations";
import { useContacts } from "@/api/contacts";
import { useLeads } from "@/api/leads";
import { useProducts } from "@/api/products";

interface EditQuoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  quoteId: string;
}

export default function EditQuoteDialog({
  open,
  onOpenChange,
  onSuccess,
  quoteId,
}: EditQuoteDialogProps) {
  const { toast } = useToast();
  const updateQuoteMutation = useUpdateQuote();

  // Fetch quote data
  const { data: quote, isLoading: isLoadingQuote } = useQuote(quoteId);

  // Fetch options for dropdowns
  const { data: organizationsData } = useOrganizations({});
  const { data: contactsData } = useContacts({});
  const { data: leadsData } = useLeads({});
  const { data: productsData } = useProducts({ status: "active" });

  const organizations = organizationsData?.results || [];
  const contacts = contactsData?.results || [];
  const leads = leadsData?.results || [];
  const products = productsData?.results || [];

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    control,
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      status: "draft",
      tax_rate: 0,
      discount_amount: 0,
      items: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Pre-fill form when quote data loads
  useEffect(() => {
    if (quote && open) {
      setValue("quote_number", quote.quote_number);
      setValue("organization", quote.organization);
      setValue("contact", quote.contact);
      setValue("lead", quote.lead);
      setValue("status", quote.status);
      setValue("tax_rate", parseFloat(quote.tax_rate));
      setValue("discount_amount", parseFloat(quote.discount_amount));
      setValue("expiry_date", quote.expiry_date || "");
      setValue("notes", quote.notes);
      setValue("terms", quote.terms);

      // Pre-fill items
      const itemsData = (quote.items || []).map((item) => ({
        product: item.product,
        quantity: parseFloat(item.quantity),
        unit_price: parseFloat(item.unit_price),
        description: item.description || "",
      }));
      setValue("items", itemsData);
    }
  }, [quote, open, setValue]);

  // Watch form values for real-time calculation
  const watchedItems = watch("items");
  const watchedTaxRate = watch("tax_rate");
  const watchedDiscount = watch("discount_amount");

  // Calculate totals in real-time
  useEffect(() => {
    const subtotal = (watchedItems || []).reduce((sum, item) => {
      const qty = parseFloat(item.quantity?.toString() || "0");
      const price = parseFloat(item.unit_price?.toString() || "0");
      return sum + qty * price;
    }, 0);

    const taxRate = parseFloat(watchedTaxRate?.toString() || "0");
    const taxAmount = (subtotal * taxRate) / 100;

    const discount = parseFloat(watchedDiscount?.toString() || "0");
    const total = subtotal + taxAmount - discount;

    setValue("subtotal", subtotal);
    setValue("tax_amount", taxAmount);
    setValue("total", total);
  }, [watchedItems, watchedTaxRate, watchedDiscount, setValue]);

  const onSubmit = async (data: QuoteFormData) => {
    try {
      await updateQuoteMutation.mutateAsync({ id: quoteId, data });
      toast({
        title: "Success",
        description: "Quote updated successfully",
      });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update quote",
        variant: "destructive",
      });
    }
  };

  const handleProductSelect = (index: number, productId: string) => {
    const selectedProduct = products.find((p) => p.id === productId);
    if (selectedProduct) {
      setValue(`items.${index}.product`, productId);
      setValue(`items.${index}.unit_price`, parseFloat(selectedProduct.price));
      setValue(`items.${index}.description`, selectedProduct.description || "");
    }
  };

  if (isLoadingQuote) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading quote...</span>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Quote</DialogTitle>
          <DialogDescription>
            Update the quote details and items. Required fields are marked with
            *.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quote_number">Quote Number *</Label>
              <Input
                id="quote_number"
                {...register("quote_number")}
                placeholder="Q-2024-001"
              />
              {errors.quote_number && (
                <p className="text-sm text-destructive">
                  {errors.quote_number.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                onValueChange={(value) =>
                  setValue(
                    "status",
                    value as
                      | "draft"
                      | "sent"
                      | "accepted"
                      | "rejected"
                      | "expired"
                  )
                }
                value={watch("status")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="accepted">Accepted</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          </div>

          {/* Organization, Contact, Lead */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="organization">Organization *</Label>
              <Select
                onValueChange={(value) => setValue("organization", value)}
                value={watch("organization")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select organization" />
                </SelectTrigger>
                <SelectContent>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.organization && (
                <p className="text-sm text-destructive">
                  {errors.organization.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact">Contact</Label>
              <Select
                onValueChange={(value) =>
                  setValue("contact", value === "none" ? null : value)
                }
                value={watch("contact") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {contacts.map((contact) => (
                    <SelectItem key={contact.id} value={contact.id}>
                      {contact.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lead">Lead</Label>
              <Select
                onValueChange={(value) =>
                  setValue("lead", value === "none" ? null : value)
                }
                value={watch("lead") || "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiry_date">Expiry Date</Label>
            <Input id="expiry_date" type="date" {...register("expiry_date")} />
            {errors.expiry_date && (
              <p className="text-sm text-destructive">
                {errors.expiry_date.message}
              </p>
            )}
          </div>

          {/* Quote Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quote Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="grid grid-cols-12 gap-2 items-start p-4 border rounded-lg"
                >
                  <div className="col-span-4 space-y-2">
                    <Label>Product *</Label>
                    <Select
                      onValueChange={(value) =>
                        handleProductSelect(index, value)
                      }
                      value={watch(`items.${index}.product`)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select product" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.sku} - {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.items?.[index]?.product && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.product?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="1"
                      {...register(`items.${index}.quantity`)}
                    />
                    {errors.items?.[index]?.quantity && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.quantity?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label>Unit Price *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register(`items.${index}.unit_price`)}
                    />
                    {errors.items?.[index]?.unit_price && (
                      <p className="text-sm text-destructive">
                        {errors.items[index]?.unit_price?.message}
                      </p>
                    )}
                  </div>

                  <div className="col-span-3 space-y-2">
                    <Label>Line Total</Label>
                    <Input
                      readOnly
                      value={(
                        parseFloat(
                          watch(`items.${index}.quantity`)?.toString() || "0"
                        ) *
                        parseFloat(
                          watch(`items.${index}.unit_price`)?.toString() || "0"
                        )
                      ).toFixed(2)}
                      className="bg-muted"
                    />
                  </div>

                  <div className="col-span-1 flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="col-span-12 space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      rows={2}
                      placeholder="Optional description override"
                      {...register(`items.${index}.description`)}
                    />
                  </div>
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  append({
                    product: "",
                    quantity: 1,
                    unit_price: 0,
                    description: "",
                  })
                }
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </CardContent>
          </Card>

          {/* Totals */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Totals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tax_rate">Tax Rate (%)</Label>
                  <Input
                    id="tax_rate"
                    type="number"
                    step="0.01"
                    {...register("tax_rate")}
                  />
                  {errors.tax_rate && (
                    <p className="text-sm text-destructive">
                      {errors.tax_rate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="discount_amount">Discount Amount ($)</Label>
                  <Input
                    id="discount_amount"
                    type="number"
                    step="0.01"
                    {...register("discount_amount")}
                  />
                  {errors.discount_amount && (
                    <p className="text-sm text-destructive">
                      {errors.discount_amount.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2 bg-muted p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="font-medium">Subtotal:</span>
                  <span>${watch("subtotal")?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tax:</span>
                  <span>${watch("tax_amount")?.toFixed(2) || "0.00"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Discount:</span>
                  <span>
                    -${watch("discount_amount")?.toFixed(2) || "0.00"}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>${watch("total")?.toFixed(2) || "0.00"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                rows={3}
                placeholder="Internal notes (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="terms">Terms & Conditions</Label>
              <Textarea
                id="terms"
                {...register("terms")}
                rows={3}
                placeholder="Payment terms, delivery conditions, etc. (optional)"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                disabled={updateQuoteMutation.isPending}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={updateQuoteMutation.isPending}>
              {updateQuoteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Quote"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
