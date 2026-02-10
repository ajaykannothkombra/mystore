import { useCart } from "@/lib/cart-context";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, ShoppingCart, Trash } from "@medusajs/icons";

export function POSCart() {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    total,
    currency,
    itemCount,
  } = useCart();

  return (
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
  );
}
