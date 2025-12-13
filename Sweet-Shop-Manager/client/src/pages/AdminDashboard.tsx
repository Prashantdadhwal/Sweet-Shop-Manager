import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Plus, Package, DollarSign, TrendingUp, AlertTriangle, Store } from "lucide-react";
import { Header } from "@/components/Header";
import { AdminSweetTable } from "@/components/AdminSweetTable";
import { SweetForm } from "@/components/SweetForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/AuthContext";
import type { Sweet } from "@shared/schema";
import { useEffect } from "react";

export default function AdminDashboard() {
  const { isAdmin, isLoading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || !isAdmin)) {
      setLocation("/login");
    }
  }, [authLoading, isAuthenticated, isAdmin, setLocation]);

  const { data: sweets = [], isLoading } = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
    enabled: isAdmin,
  });

  const stats = useMemo(() => {
    const totalSweets = sweets.length;
    const totalStock = sweets.reduce((sum, s) => sum + s.quantity, 0);
    const totalValue = sweets.reduce((sum, s) => sum + s.price * s.quantity, 0);
    const lowStock = sweets.filter((s) => s.quantity > 0 && s.quantity <= 5).length;
    const outOfStock = sweets.filter((s) => s.quantity === 0).length;

    return { totalSweets, totalStock, totalValue, lowStock, outOfStock };
  }, [sweets]);

  const handleEdit = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setFormOpen(true);
  };

  const handleFormClose = (open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingSweet(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Store className="h-8 w-8 text-primary" />
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your sweet shop inventory
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2" data-testid="button-add-sweet">
            <Plus className="h-4 w-4" />
            Add Sweet
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Products
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-products">
                  {stats.totalSweets}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Stock
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-total-stock">
                  {stats.totalStock} units
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Inventory Value
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold" data-testid="text-inventory-value">
                  ${stats.totalValue.toFixed(2)}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Stock Alerts
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div>
                  <div className="text-2xl font-bold" data-testid="text-stock-alerts">
                    {stats.lowStock + stats.outOfStock}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.lowStock} low, {stats.outOfStock} out
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">All Sweets</h2>
          </div>
          
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-lg" />
              ))}
            </div>
          ) : (
            <AdminSweetTable sweets={sweets} onEdit={handleEdit} />
          )}
        </div>
      </main>

      <SweetForm
        sweet={editingSweet}
        open={formOpen}
        onOpenChange={handleFormClose}
      />
    </div>
  );
}
