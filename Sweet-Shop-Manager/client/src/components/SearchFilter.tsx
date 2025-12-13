import { Search, X, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";

export interface SearchFilters {
  name: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

interface SearchFilterProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  categories: string[];
}

export function SearchFilter({ filters, onFiltersChange, categories }: SearchFilterProps) {
  const [priceRange, setPriceRange] = useState([filters.minPrice, filters.maxPrice]);

  const hasActiveFilters = 
    filters.name !== "" || 
    filters.category !== "" || 
    filters.minPrice > 0 || 
    filters.maxPrice < 100;

  const clearFilters = () => {
    onFiltersChange({
      name: "",
      category: "",
      minPrice: 0,
      maxPrice: 100,
    });
    setPriceRange([0, 100]);
  };

  const handlePriceChange = (value: number[]) => {
    setPriceRange(value);
    onFiltersChange({
      ...filters,
      minPrice: value[0],
      maxPrice: value[1],
    });
  };

  return (
    <div className="sticky top-16 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search sweets..."
              value={filters.name}
              onChange={(e) => onFiltersChange({ ...filters, name: e.target.value })}
              className="pl-10"
              data-testid="input-search"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select
              value={filters.category}
              onValueChange={(value) => onFiltersChange({ ...filters, category: value === "all" ? "" : value })}
            >
              <SelectTrigger className="w-[140px]" data-testid="select-category">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2" data-testid="button-price-filter">
                  <SlidersHorizontal className="h-4 w-4" />
                  Price
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Price Range</Label>
                    <Slider
                      value={priceRange}
                      onValueChange={handlePriceChange}
                      max={100}
                      min={0}
                      step={1}
                      data-testid="slider-price"
                    />
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>${priceRange[0]}</span>
                      <span>${priceRange[1]}</span>
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="icon"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
