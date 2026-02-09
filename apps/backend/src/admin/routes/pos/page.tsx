import { defineRouteConfig } from "@medusajs/admin-sdk";
import { Container, Heading, Text, Input, Button, Badge } from "@medusajs/ui";
import {
  CurrencyDollar,
  ShoppingCart,
  MagnifyingGlass,
  Plus,
  Minus,
  XMark,
} from "@medusajs/icons";
import { useState, useEffect } from "react";
import { sdk } from "../../lib/sdk";

type Product = {
  id: string;
  title: string;
  thumbnail: string | null;
  variants: {
    id: string;
    title: string;
    sku: string | null;
    calculated_price?: {
      calculated_amount: number;
      currency_code: string;
    };
  }[];
};

type CartItem = {
  variantId: string;
  productTitle: string;
  variantTitle: string;
  sku: string | null;
  price: number;
  currencyCode: string;
  quantity: number;
  thumbnail: string | null;
};

const POSPage = () => {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch products for search
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await sdk.admin.product.list({
          q: search || undefined,
          limit: 20,
          fields: "id,title,thumbnail,*variants,*variants.calculated_price",
        });
        setProducts((response.products || []) as Product[]);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(fetchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  const addToCart = (product: Product, variant: Product["variants"][0]) => {
    const existingItem = cart.find((item) => item.variantId === variant.id);

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.variantId === variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      );
    } else {
      setCart([
        ...cart,
        {
          variantId: variant.id,
          productTitle: product.title,
          variantTitle: variant.title,
          sku: variant.sku,
          price: variant.calculated_price?.calculated_amount || 0,
          currencyCode: variant.calculated_price?.currency_code || "usd",
          quantity: 1,
          thumbnail: product.thumbnail,
        },
      ]);
    }
  };

  const updateQuantity = (variantId: string, delta: number) => {
    setCart(
      cart
        .map((item) =>
          item.variantId === variantId
            ? { ...item, quantity: item.quantity + delta }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeItem = (variantId: string) => {
    setCart(cart.filter((item) => item.variantId !== variantId));
  };

  const clearCart = () => setCart([]);

  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const currencyCode = cart[0]?.currencyCode || "usd";

  const formatPrice = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  return (
    <div className="flex h-[calc(100vh-57px)] gap-4 p-4">
      {/* Left Panel - Product Search */}
      <div className="flex flex-1 flex-col gap-4">
        <Container className="p-0">
          <div className="px-6 py-4">
            <div className="relative">
              <MagnifyingGlass className="text-ui-fg-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search products by name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </Container>

        <Container className="flex-1 overflow-auto p-0">
          <div className="grid grid-cols-2 gap-4 p-4 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading ? (
              <div className="text-ui-fg-subtle col-span-full py-8 text-center">
                Loading products...
              </div>
            ) : products.length === 0 ? (
              <div className="text-ui-fg-subtle col-span-full py-8 text-center">
                No products found
              </div>
            ) : (
              products.map((product) =>
                product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => addToCart(product, variant)}
                    className="bg-ui-bg-base hover:bg-ui-bg-base-hover border-ui-border-base flex flex-col rounded-lg border p-3 text-left transition-colors"
                  >
                    <div className="bg-ui-bg-subtle mb-2 aspect-square w-full overflow-hidden rounded-md">
                      {product.thumbnail ? (
                        <img
                          src={product.thumbnail}
                          alt={product.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="text-ui-fg-muted h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <Text size="small" weight="plus" className="line-clamp-1">
                      {product.title}
                    </Text>
                    {variant.title !== "Default" && (
                      <Text
                        size="xsmall"
                        className="text-ui-fg-subtle line-clamp-1"
                      >
                        {variant.title}
                      </Text>
                    )}
                    {variant.sku && (
                      <Text size="xsmall" className="text-ui-fg-muted">
                        SKU: {variant.sku}
                      </Text>
                    )}
                    <Text
                      size="small"
                      weight="plus"
                      className="text-ui-fg-base mt-1"
                    >
                      {variant.calculated_price
                        ? formatPrice(
                            variant.calculated_price.calculated_amount,
                            variant.calculated_price.currency_code,
                          )
                        : "No price"}
                    </Text>
                  </button>
                )),
              )
            )}
          </div>
        </Container>
      </div>

      {/* Right Panel - Cart */}
      <div className="flex w-96 flex-col gap-4">
        <Container className="flex-1 overflow-hidden p-0">
          <div className="border-ui-border-base flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-2">
              <ShoppingCart className="text-ui-fg-subtle" />
              <Heading level="h2">Current Sale</Heading>
            </div>
            {cart.length > 0 && (
              <Button size="small" variant="secondary" onClick={clearCart}>
                Clear
              </Button>
            )}
          </div>

          <div className="flex h-[calc(100%-140px)] flex-col overflow-auto">
            {cart.length === 0 ? (
              <div className="text-ui-fg-subtle flex flex-1 flex-col items-center justify-center gap-2 p-6">
                <ShoppingCart className="h-12 w-12 opacity-50" />
                <Text>No items in cart</Text>
                <Text size="small" className="text-ui-fg-muted">
                  Click products to add them
                </Text>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div
                    key={item.variantId}
                    className="flex items-center gap-3 px-4 py-3"
                  >
                    <div className="bg-ui-bg-subtle h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                      {item.thumbnail ? (
                        <img
                          src={item.thumbnail}
                          alt={item.productTitle}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ShoppingCart className="text-ui-fg-muted h-4 w-4" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Text size="small" weight="plus" className="truncate">
                        {item.productTitle}
                      </Text>
                      {item.variantTitle !== "Default" && (
                        <Text
                          size="xsmall"
                          className="text-ui-fg-subtle truncate"
                        >
                          {item.variantTitle}
                        </Text>
                      )}
                      <Text size="small" className="text-ui-fg-muted">
                        {formatPrice(item.price, item.currencyCode)}
                      </Text>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.variantId, -1)}
                        className="hover:bg-ui-bg-base-hover rounded p-1"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <Badge
                        size="2xsmall"
                        className="min-w-[24px] justify-center"
                      >
                        {item.quantity}
                      </Badge>
                      <button
                        onClick={() => updateQuantity(item.variantId, 1)}
                        className="hover:bg-ui-bg-base-hover rounded p-1"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-ui-fg-muted hover:text-ui-fg-base hover:bg-ui-bg-base-hover ml-1 rounded p-1"
                      >
                        <XMark className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          <div className="border-ui-border-base border-t px-6 py-4">
            <div className="mb-4 flex items-center justify-between">
              <Text size="large" weight="plus">
                Total
              </Text>
              <Text size="large" weight="plus">
                {formatPrice(subtotal, currencyCode)}
              </Text>
            </div>
            <Button
              className="w-full"
              size="large"
              disabled={cart.length === 0}
            >
              <CurrencyDollar className="mr-2" />
              Complete Sale
            </Button>
          </div>
        </Container>
      </div>
    </div>
  );
};

export const config = defineRouteConfig({
  label: "Point of Sale",
  icon: CurrencyDollar,
});

export default POSPage;
