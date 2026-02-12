import { useCart } from "../lib/cart-context";
import { usePOSData } from "@/features/pos/api/usePOSData";
import type { HttpTypes } from "@medusajs/types";
import { POSHeader } from "@/features/pos/components/POSHeader";
import { POSCart } from "@/features/pos/components/POSCart";

export default function POSPage() {
  const { products, filters, actions } = usePOSData();
  // const [selectedCustomer, setSelectedCustomer] =
  //   useState<HttpTypes.AdminCustomer | null>(null);

  const { addItem } = useCart();

  const handleAddToCart = (variant: HttpTypes.AdminProductVariant) => {
    const product = variant.product;

    if (!product) {
      console.error("Variant is missing joined product data");
      return;
    }

    const price = variant.prices?.[0];
    if (!price) {
      console.error("This item has no price defined.");
      return;
    }

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

    // CRITICAL: Clear for next scan immediately
    actions.setProductSearch("");
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const rawInput = filters.productSearch.trim();
      if (!rawInput) return;

      // Execute immediate 'Fast Lane' scan
      const result = await actions.handleBarcodeScan(rawInput);

      console.log("result is ", result);

      if (result) {
        handleAddToCart(result);
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <POSHeader />
      <div className="flex flex-1 overflow-hidden p-4 gap-4">
        {/* LEFT/CENTER: THE TRANSACTION AREA (CENTER STAGE) */}
        <div className="flex flex-[3] flex-col bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          {/* PRIMARY SEARCH & SCAN BAR */}
          <div className="p-6 bg-white border-b shadow-sm">
            <div className="relative group">
              <input
                autoFocus
                type="text"
                placeholder="Scan Barcode or Search ..."
                className="w-full text-2xl p-5 bg-gray-50 border-2 border-transparent focus:border-blue-600 focus:bg-white rounded-lg transition-all outline-none"
                value={filters.productSearch}
                onChange={(e) => actions.setProductSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />

              {/* TRACK 1: Manual Search Dropdown (Debounced) */}
              {filters.productSearch && products.length > 0 && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border shadow-2xl rounded-lg max-h-96 overflow-y-auto">
                  {products.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        handleAddToCart(item);
                      }}
                      className="w-full text-left p-4 hover:bg-blue-50 border-b flex justify-between"
                    >
                      <span>
                        {item.product?.title} ({item.title})
                      </span>
                      <span className="font-bold text-blue-600">
                        ${item.prices?.[0]?.amount}
                      </span>
                    </button>
                  ))}
                </div>
              )}
              <div className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400">
                <span className="text-xs font-bold border border-gray-300 rounded px-2 py-1">
                  READY TO SCAN
                </span>
              </div>
            </div>
          </div>

          {/* THE CART LIST - Now takes up the bulk of the screen */}
          <div className="flex-1 overflow-y-auto">
            <POSCart />
          </div>

          {/* QUICK TOTALS FOOTER (Optional/Retail Style) */}
          <div className="p-6 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-gray-500">
              Items: <span className="font-bold text-black">4</span>
            </div>
            <div className="text-3xl font-black text-blue-700">
              TOTAL: $142.00
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR: CONTEXT & ACTIONS */}
        <div className="flex flex-1 flex-col gap-4 min-w-[350px]">
          {/* CUSTOMER LOOKUP */}
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-3 tracking-wider">
              Customer
            </h3>
            {/* <POSCustomerLookup
              search={filters.customerSearch}
              customers={customers}
              onQuickAdd={() => console.log("implement quick add")}
              onSearch={() => {}}
              onSelect={() => {}}
              selectedCustomer={selectedCustomer}
            /> */}
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex-1 bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase mb-2 tracking-wider">
              Transaction
            </h3>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-xl font-black text-xl shadow-lg transition-transform active:scale-95">
              PAYMENT (F1)
            </button>

            <div className="grid grid-cols-2 gap-2 mt-auto">
              <button className="bg-gray-100 hover:bg-gray-200 p-4 rounded-lg font-bold text-gray-700">
                DISCOUNT
              </button>
              <button className="bg-red-50 hover:bg-red-100 p-4 rounded-lg font-bold text-red-600">
                VOID
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
