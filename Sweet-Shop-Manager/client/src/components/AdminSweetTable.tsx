import { useState } from "react";
import { Pencil, Trash2, Plus, Minus, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Sweet } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface AdminSweetTableProps {
  sweets: Sweet[];
  onEdit: (sweet: Sweet) => void;
}

export function AdminSweetTable({ sweets, onEdit }: AdminSweetTableProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [deleteSweet, setDeleteSweet] = useState<Sweet | null>(null);
  const [restockSweet, setRestockSweet] = useState<Sweet | null>(null);
  const [restockAmount, setRestockAmount] = useState(10);

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/sweets/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({ title: "Sweet deleted successfully" });
      setDeleteSweet(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to delete",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const restockMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      await apiRequest("POST", `/api/sweets/${id}/restock`, { amount }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sweets"] });
      toast({ title: "Sweet restocked successfully" });
      setRestockSweet(null);
      setRestockAmount(10);
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to restock",
        description: error.message,
        variant: "destructive",
      });
    },
  });

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

  if (sweets.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border">
        <Package className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium">No sweets yet</h3>
        <p className="text-muted-foreground">Add your first sweet to get started</p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden md:block rounded-lg border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sweets.map((sweet) => (
              <TableRow key={sweet.id} data-testid={`row-sweet-${sweet.id}`}>
                <TableCell>
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted">
                    {sweet.imageUrl ? (
                      <img
                        src={sweet.imageUrl}
                        alt={sweet.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <Package className="h-6 w-6 text-muted-foreground/40" />
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{sweet.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getCategoryColor(sweet.category)}>
                    {sweet.category}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  ${sweet.price.toFixed(2)}
                </TableCell>
                <TableCell className="text-right">
                  <span className={sweet.quantity <= 5 ? "text-amber-600 font-medium" : ""}>
                    {sweet.quantity}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRestockSweet(sweet)}
                      data-testid={`button-restock-${sweet.id}`}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(sweet)}
                      data-testid={`button-edit-${sweet.id}`}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteSweet(sweet)}
                      className="text-destructive"
                      data-testid={`button-delete-${sweet.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {sweets.map((sweet) => (
          <div
            key={sweet.id}
            className="bg-card rounded-lg border p-4 space-y-3"
            data-testid={`card-admin-sweet-${sweet.id}`}
          >
            <div className="flex items-start gap-3">
              <div className="h-16 w-16 rounded-md overflow-hidden bg-muted shrink-0">
                {sweet.imageUrl ? (
                  <img
                    src={sweet.imageUrl}
                    alt={sweet.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground/40" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{sweet.name}</h3>
                <Badge variant="secondary" className={`${getCategoryColor(sweet.category)} mt-1`}>
                  {sweet.category}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="font-medium">${sweet.price.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Stock</p>
                  <p className={`font-medium ${sweet.quantity <= 5 ? "text-amber-600" : ""}`}>
                    {sweet.quantity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setRestockSweet(sweet)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(sweet)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteSweet(sweet)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AlertDialog open={!!deleteSweet} onOpenChange={() => setDeleteSweet(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Sweet</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteSweet?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteSweet && deleteMutation.mutate(deleteSweet.id)}
              className="bg-destructive text-destructive-foreground"
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={!!restockSweet} onOpenChange={() => setRestockSweet(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restock Sweet</DialogTitle>
            <DialogDescription>
              Add inventory for "{restockSweet?.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="restock-amount">Amount to add</Label>
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRestockAmount(Math.max(1, restockAmount - 5))}
                data-testid="button-decrease-restock"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="restock-amount"
                type="number"
                min={1}
                value={restockAmount}
                onChange={(e) => setRestockAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="text-center"
                data-testid="input-restock-amount"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setRestockAmount(restockAmount + 5)}
                data-testid="button-increase-restock"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Current stock: {restockSweet?.quantity} → New stock: {(restockSweet?.quantity || 0) + restockAmount}
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRestockSweet(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => restockSweet && restockMutation.mutate({ id: restockSweet.id, amount: restockAmount })}
              disabled={restockMutation.isPending}
              data-testid="button-confirm-restock"
            >
              {restockMutation.isPending ? "Restocking..." : "Restock"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
