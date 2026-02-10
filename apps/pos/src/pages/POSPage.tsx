import { useCart } from "../lib/cart-context";
import { usePOSData } from "@/features/pos/api/usePOSData";
import type { HttpTypes } from "@medusajs/types";
import { POSHeader } from "@/features/pos/components/POSHeader";
import { POSFilters } from "@/features/pos/components/POSFilters";
import { ProductGrid } from "@/features/pos/components/ProductGrid";
import { POSCart } from "@/features/pos/components/POSCart";
import { POSCustomerLookup } from "@/features/pos/components/POSCustomerLookup";
import { useState } from "react";

export default function POSPage() {
  const { products, categories, customers, isLoading, filters, actions } =
    usePOSData();
  const [selectedCustomer, setSelectedCustomer] =
    useState<HttpTypes.AdminCustomer | null>(null);

  const { addItem } = useCart();

  const handleAddToCart = (
    product: HttpTypes.AdminProduct,
    variant: HttpTypes.AdminProductVariant,
  ) => {
    const price = variant.prices?.[0];
    if (!price) return;

    addItem({
      variant_id: variant.id,
      product_id: product.id,
      title: product.title,
      variant_title: variant.title || "Default",
      thumbnail: product.thumbnail,
      price: price.amount,
      currency_code: price.currency_code,
      sku: variant.sku,
    });
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <POSHeader />
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Products */}
        <div className="flex flex-1 flex-col overflow-hidden">
          <POSCustomerLookup
            search={filters.customerSearch}
            onSearch={actions.setCustomerSearch}
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelect={setSelectedCustomer}
            onQuickAdd={() => {
              // Trigger your Quick Add logic here using filters.customerSearch
              console.log(
                "Adding customer with phone:",
                filters.customerSearch,
              );
            }}
          />

          <POSFilters
            categories={categories}
            search={filters.productSearch}
            selectedCategoryId={filters.selectedCategory}
            onSelectCategory={actions.setSelectedCategory}
            setSearch={actions.setProductSearch}
          />

          <ProductGrid
            isLoading={isLoading}
            onAddToCart={handleAddToCart}
            products={products}
          />
        </div>

        {/* Right: Cart */}
        <POSCart />
      </div>
    </div>
  );
}
