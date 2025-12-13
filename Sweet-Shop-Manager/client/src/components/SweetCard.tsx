import { useState } from "react";
import { ShoppingCart, Package, AlertCircle, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Sweet } from "@shared/schema";
import { useAuth } from "@/context/AuthContext";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface SweetCardProps {
  sweet: Sweet;
}

export function SweetCard({ sweet }: SweetCardProps) {
  const { isAuthenticated, token } = useAuth();
  const { toast } = useToast();
  const [justPurchased, setJustPurchased] = useState(false);

  const purchaseMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/sweets/${sweet.id}/purchase`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      setJustPurchased(true);
      toast({
        title: "Purchase Successful",
        description: `You purchased ${sweet.name}!`,
      });
      setTimeout(() => setJustPurchased(false), 2000);
    },
    onError: (error: Error) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    },
  });

  const isOutOfStock = sweet.quantity <= 0;
  const isLowStock = sweet.quantity > 0 && sweet.quantity <= 5;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      chocolate: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
      candy: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
      cake: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
      cookie: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
      pastry: "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300",
      ice_cream: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
    };
    return colors[category.toLowerCase()] || "bg-muted text-muted-foreground";
  };

  return (
    <Card 
      className={`overflow-visible group transition-transform duration-200 hover:-translate-y-1 ${
        isOutOfStock ? "opacity-60" : ""
      }`}
      data-testid={`card-sweet-${sweet.id}`}
    >
      <div className="aspect-square overflow-hidden rounded-t-md bg-muted">
        {sweet.imageUrl ? (
          <img
            src={sweet.imageUrl}
            alt={sweet.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <Package className="h-16 w-16 text-muted-foreground/40" />
          </div>
        )}
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge 
            variant="secondary" 
            className={`${getCategoryColor(sweet.category)} text-xs font-medium`}
            data-testid={`badge-category-${sweet.id}`}
          >
            {sweet.category}
          </Badge>
          {isLowStock && !isOutOfStock && (
            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
              <AlertCircle className="mr-1 h-3 w-3" />
              Low Stock
            </Badge>
          )}
        </div>

        <div>
          <h3 className="font-display text-lg font-semibold line-clamp-1" data-testid={`text-sweet-name-${sweet.id}`}>
            {sweet.name}
          </h3>
          {sweet.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1" data-testid={`text-sweet-description-${sweet.id}`}>
              {sweet.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-2xl font-bold text-primary" data-testid={`text-sweet-price-${sweet.id}`}>
              ${sweet.price.toFixed(2)}
            </p>
            <p className="text-xs text-muted-foreground" data-testid={`text-sweet-stock-${sweet.id}`}>
              {isOutOfStock ? (
                <span className="text-destructive font-medium">Out of stock</span>
              ) : (
                `${sweet.quantity} in stock`
              )}
            </p>
          </div>

          <Button
            size="default"
            disabled={isOutOfStock || !isAuthenticated || purchaseMutation.isPending}
            onClick={() => purchaseMutation.mutate()}
            className="shrink-0"
            data-testid={`button-purchase-${sweet.id}`}
          >
            {purchaseMutation.isPending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              </span>
            ) : justPurchased ? (
              <Check className="h-4 w-4" />
            ) : (
              <ShoppingCart className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isAuthenticated && (
          <p className="text-xs text-muted-foreground text-center" data-testid={`text-login-prompt-${sweet.id}`}>
            Login to purchase
          </p>
        )}
      </CardContent>
    </Card>
  );
}
