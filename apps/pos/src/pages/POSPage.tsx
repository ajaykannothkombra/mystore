import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { sdk } from "../lib/sdk";
import { useAuth } from "../lib/auth-context";
import { useCart } from "../lib/cart-context";
import { formatPrice } from "../lib/utils";
import {
  MagnifyingGlass,
  XMark,
  Plus,
  Minus,
  Trash,
  ArrowRightOnRectangle,
  ShoppingCart,
} from "@medusajs/icons";

interface ProductVariant {
  id: string;
  title: string;
  sku: string | null;
  prices: Array<{
    amount: number;
    currency_code: string;
  }>;
}

interface Product {
  id: string;
  title: string;
  thumbnail: string | null;
  variants: ProductVariant[];
}

export default function POSPage() {
  const { user, logout } = useAuth();
  const {
    items,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    currency,
    itemCount,
  } = useCart();
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Fetch products
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products", search, selectedCategory],
    queryFn: async () => {
      const params: Record<string, unknown> = {
        limit: 50,
        fields: "id,title,thumbnail,*variants,*variants.prices",
      };
      if (search) {
        params.q = search;
      }
      if (selectedCategory) {
        params.category_id = [selectedCategory];
      }
      const response = await sdk.admin.product.list(params);
      return response.products as Product[];
    },
  });

  // Fetch categories
  const { data: categoriesData } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const response = await sdk.admin.productCategory.list({
        limit: 50,
        fields: "id,name,handle",
      });
      return response.product_categories;
    },
  });

  const handleAddToCart = (product: Product, variant: ProductVariant) => {
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

  const products = productsData || [];
  const categories = categoriesData || [];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left: Products */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gray-900 text-white">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <h1 className="text-xl font-semibold text-gray-900">
              Point of Sale
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              {user?.first_name || user?.email}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm hover:bg-gray-50"
            >
              <ArrowRightOnRectangle className="h-4 w-4" />
              Logout
            </button>
          </div>
        </header>

        {/* Search and Categories */}
        <div className="border-b border-gray-200 bg-white px-6 py-4">
          <div className="relative mb-4">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMark className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                selectedCategory === null
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Products
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                  selectedCategory === category.id
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-auto p-6">
          {productsLoading ? (
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
                const price = variant?.prices?.[0];

                return (
                  <button
                    key={product.id}
                    onClick={() => variant && handleAddToCart(product, variant)}
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
      </div>

      {/* Right: Cart */}
      <div className="flex w-[400px] flex-col border-l border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-900">Current Sale</h2>
          {items.length > 0 && (
            <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </span>
          )}
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-auto p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                <ShoppingCart className="h-6 w-6 text-gray-400" />
              </div>
              <span className="text-gray-400">No items in cart</span>
              <span className="mt-1 text-sm text-gray-300">
                Click on products to add them
              </span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map((item) => (
                <div
                  key={item.variant_id}
                  className="flex gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3"
                >
                  {/* Thumbnail */}
                  <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-white">
                    {item.thumbnail ? (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-[10px] text-gray-300">
                        No img
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col">
                    <div className="text-sm font-medium text-gray-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {item.variant_title}
                    </div>
                    <div className="mt-auto text-sm font-semibold text-gray-900">
                      {formatPrice(
                        item.price * item.quantity,
                        item.currency_code,
                      )}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <button
                      onClick={() => removeItem(item.variant_id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, item.quantity - 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="min-w-[32px] text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.variant_id, item.quantity + 1)
                        }
                        className="flex h-7 w-7 items-center justify-center rounded border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="mb-4 flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Total</span>
            <span className="text-lg font-semibold text-gray-900">
              {formatPrice(total, currency)}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={clearCart}
              disabled={items.length === 0}
              className="rounded-md border border-gray-200 bg-white py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Clear Cart
            </button>
            <button
              disabled={items.length === 0}
              className="rounded-md bg-gray-900 py-3 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
