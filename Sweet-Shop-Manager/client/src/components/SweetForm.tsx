import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Image, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Sweet } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const sweetFormSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().min(0.01, "Price must be greater than 0"),
  quantity: z.coerce.number().int().min(0, "Quantity must be 0 or greater"),
  imageUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(500).optional(),
});

type SweetFormValues = z.infer<typeof sweetFormSchema>;

const CATEGORIES = [
  { value: "chocolate", label: "Chocolate" },
  { value: "candy", label: "Candy" },
  { value: "cake", label: "Cake" },
  { value: "cookie", label: "Cookie" },
  { value: "pastry", label: "Pastry" },
  { value: "ice_cream", label: "Ice Cream" },
];

interface SweetFormProps {
  sweet?: Sweet | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SweetForm({ sweet, open, onOpenChange }: SweetFormProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [imagePreview, setImagePreview] = useState(sweet?.imageUrl || "");
  const isEditing = !!sweet;

  const form = useForm<SweetFormValues>({
    resolver: zodResolver(sweetFormSchema),
    defaultValues: {
      name: sweet?.name || "",
      category: sweet?.category || "",
      price: sweet?.price || 0,
      quantity: sweet?.quantity || 0,
      imageUrl: sweet?.imageUrl || "",
      description: sweet?.description || "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (values: SweetFormValues) => {
      if (isEditing) {
        await apiRequest("PUT", `/api/sweets/${sweet.id}`, values, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await apiRequest("POST", "/api/sweets", values, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({
        title: isEditing ? "Sweet updated" : "Sweet added",
        description: isEditing ? "The sweet has been updated successfully." : "The sweet has been added successfully.",
      });
      onOpenChange(false);
      form.reset();
      setImagePreview("");
    },
    onError: (error: Error) => {
      toast({
        title: isEditing ? "Failed to update" : "Failed to add",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUrlChange = (url: string) => {
    form.setValue("imageUrl", url);
    setImagePreview(url);
  };

  const onSubmit = (values: SweetFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {isEditing ? "Edit Sweet" : "Add New Sweet"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the details of this sweet."
              : "Fill in the details to add a new sweet to your inventory."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Chocolate Truffle" 
                          {...field} 
                          data-testid="input-sweet-name"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-sweet-category">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORIES.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            step="0.01" 
                            min="0" 
                            placeholder="9.99" 
                            {...field} 
                            data-testid="input-sweet-price"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Initial Stock</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0" 
                            placeholder="50" 
                            {...field} 
                            data-testid="input-sweet-quantity"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Image URL</FormLabel>
                      <FormControl>
                        <div className="space-y-3">
                          <Input 
                            placeholder="https://example.com/image.jpg" 
                            value={field.value || ""}
                            onChange={(e) => handleImageUrlChange(e.target.value)}
                            data-testid="input-sweet-image"
                          />
                          <div className="h-32 rounded-lg border-2 border-dashed bg-muted/50 flex items-center justify-center overflow-hidden">
                            {imagePreview ? (
                              <div className="relative w-full h-full">
                                <img
                                  src={imagePreview}
                                  alt="Preview"
                                  className="w-full h-full object-cover"
                                  onError={() => setImagePreview("")}
                                />
                                <Button
                                  type="button"
                                  variant="secondary"
                                  size="icon"
                                  className="absolute top-2 right-2"
                                  onClick={() => handleImageUrlChange("")}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="text-center text-muted-foreground">
                                <Image className="h-8 w-8 mx-auto mb-2" />
                                <p className="text-sm">Enter URL above to preview</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A delicious treat made with the finest ingredients..."
                      className="h-24 resize-none"
                      {...field}
                      data-testid="input-sweet-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={mutation.isPending}
                data-testid="button-submit-sweet"
              >
                {mutation.isPending
                  ? isEditing
                    ? "Updating..."
                    : "Adding..."
                  : isEditing
                  ? "Update Sweet"
                  : "Add Sweet"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
