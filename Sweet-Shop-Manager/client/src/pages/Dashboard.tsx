import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Search, Store } from "lucide-react";
import { Header } from "@/components/Header";
import { SweetCard } from "@/components/SweetCard";
import { SearchFilter, type SearchFilters } from "@/components/SearchFilter";
import { Skeleton } from "@/components/ui/skeleton";
import type { Sweet } from "@shared/schema";

export default function Dashboard() {
  const [filters, setFilters] = useState<SearchFilters>({
    name: "",
    category: "",
    minPrice: 0,
    maxPrice: 100,
  });

  const { data: sweets = [], isLoading } = useQuery<Sweet[]>({
    queryKey: ["/api/sweets"],
  });

  const availableSweets = useMemo(() => {
    return sweets.filter((sweet) => sweet.quantity > 0);
  }, [sweets]);

  const categories = useMemo(() => {
    const cats = new Set(sweets.map((s) => s.category));
    return Array.from(cats);
  }, [sweets]);

  const filteredSweets = useMemo(() => {
    return availableSweets.filter((sweet) => {
      const matchesName = sweet.name.toLowerCase().includes(filters.name.toLowerCase());
      const matchesCategory = !filters.category || sweet.category === filters.category;
      const matchesPrice = sweet.price >= filters.minPrice && sweet.price <= filters.maxPrice;
      return matchesName && matchesCategory && matchesPrice;
    });
  }, [availableSweets, filters]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <section className="relative h-[50vh] md:h-[60vh] flex items-center justify-center overflow-hidden" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499195333224-3ce974eecb47?w=1920&q=80')] bg-cover bg-center opacity-20" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Store className="h-4 w-4" />
            <span className="text-sm font-medium" data-testid="text-welcome">Welcome to Sweet Shop</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-4" data-testid="text-hero-title">
            Indulge in <span className="text-primary">Sweetness</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Discover our handcrafted collection of premium confections, made with love and the finest ingredients.
          </p>
        </div>
      </section>

      <SearchFilter
        filters={filters}
        onFiltersChange={setFilters}
        categories={categories}
      />

      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex justify-between items-center">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-9 w-9 rounded-md" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSweets.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-muted mb-4">
              {filters.name || filters.category ? (
                <Search className="h-8 w-8 text-muted-foreground" />
              ) : (
                <Package className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">
              {filters.name || filters.category ? "No sweets found" : "No sweets available"}
            </h2>
            <p className="text-muted-foreground">
              {filters.name || filters.category
                ? "Try adjusting your search or filters"
                : "Check back soon for new delicious treats!"}
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-muted-foreground" data-testid="text-showing-count">
                Showing <span className="font-medium text-foreground">{filteredSweets.length}</span> sweets
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" data-testid="grid-sweets">
              {filteredSweets.map((sweet) => (
                <SweetCard key={sweet.id} sweet={sweet} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
