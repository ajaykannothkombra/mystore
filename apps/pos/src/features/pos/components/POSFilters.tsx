import { cn } from "@/lib/utils";
import { XMark } from "@medusajs/icons";
import type { HttpTypes } from "@medusajs/types";
import { Button, Input } from "@medusajs/ui";

interface POSFiltersProps {
  search: string;
  setSearch: (val: string) => void;
  categories: HttpTypes.AdminProductCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export function POSFilters({
  search,
  setSearch,
  categories,
  selectedCategoryId,
  onSelectCategory,
}: POSFiltersProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="relative mb-4">
        <Input
          type="search"
          placeholder={"Search products..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="align-center absolute right-3 top-[55%] -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <XMark className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-xs font-medium",
            "bg-gray-100 text-gray-600 hover:bg-gray-200",
            {
              "bg-gray-900 text-white": selectedCategoryId === null,
            },
          )}
        >
          All Products
        </Button>
        {categories.map((category) => (
          <Button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-xs font-medium",
              "bg-gray-100 text-gray-600 hover:bg-gray-200",
              { "bg-gray-900 text-white": selectedCategoryId === category.id },
            )}
          >
            {category.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
