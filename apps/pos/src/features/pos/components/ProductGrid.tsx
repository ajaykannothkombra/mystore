import { formatPrice } from "@/lib/utils";
import type { HttpTypes } from "@medusajs/types";

interface ProductGridProps {
  products: HttpTypes.AdminProduct[];
  isLoading: boolean;
  onAddToCart: (
    product: HttpTypes.AdminProduct,
    productVariant: HttpTypes.AdminProductVariant,
  ) => void;
}

export function ProductGrid({
  products,
  isLoading,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="flex-1 overflow-auto p-6">
      {isLoading ? (
        <div className="flex h-full items-center justify-center">
          <span className="text-gray-400">Loading products...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center">
          <span className="text-gray-400">No products found</span>
          <span className="mt-1 text-sm text-gray-300">
            Try adjusting your search or category filter
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4">
          {products.map((product) => {
            const variant = product.variants?.[0];

            if (!variant) return null;

            const price = variant.prices?.[0];

            return (
              <button
                key={product.id}
                onClick={() => variant && onAddToCart(product, variant)}
                className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white text-left transition-shadow hover:shadow-md"
              >
                <div className="aspect-square overflow-hidden bg-gray-100">
                  {product.thumbnail ? (
                    <img
                      src={product.thumbnail}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-gray-300">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="mb-1 line-clamp-2 text-sm font-medium text-gray-900">
                    {product.title}
                  </div>
                  {price && (
                    <div className="text-sm font-semibold text-gray-900">
                      {formatPrice(price.amount, price.currency_code)}
                    </div>
                  )}
                  {variant?.sku && (
                    <div className="mt-1 text-xs text-gray-400">
                      SKU: {variant.sku}
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
