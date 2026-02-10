import { User, XMark, MagnifyingGlass, Plus } from "@medusajs/icons";
import { HttpTypes } from "@medusajs/types";

interface POSCustomerLookupProps {
  search: string;
  onSearch: (val: string) => void;
  customers: HttpTypes.AdminCustomer[];
  selectedCustomer: HttpTypes.AdminCustomer | null;
  onSelect: (customer: HttpTypes.AdminCustomer | null) => void;
  onQuickAdd: () => void;
}

export function POSCustomerLookup({
  search,
  onSearch,
  customers,
  selectedCustomer,
  onSelect,
  onQuickAdd,
}: POSCustomerLookupProps) {
  return (
    <div className="border-b border-gray-200 bg-white px-6 py-3">
      {selectedCustomer ? (
        /* Selected State */
        <div className="flex items-center justify-between rounded-lg border border-violet-200 bg-violet-50 px-4 py-2">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 text-white">
              <User className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-violet-900">
                {selectedCustomer.first_name} {selectedCustomer.last_name}
              </p>
              <p className="text-xs text-violet-700">
                {selectedCustomer.phone}
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelect(null)}
            className="text-violet-400 hover:text-violet-600"
          >
            <XMark className="h-5 w-5" />
          </button>
        </div>
      ) : (
        /* Search State */
        <div className="relative">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Lookup customer by phone or name..."
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              className="w-full rounded-md border border-gray-300 py-2 pl-9 pr-4 text-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            />
          </div>

          {/* Results Dropdown */}
          {search.length >= 2 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-gray-200 bg-white shadow-xl">
              {customers.length > 0 ? (
                <ul className="max-h-60 overflow-auto py-1">
                  {customers.map((c) => (
                    <li key={c.id}>
                      <button
                        onClick={() => {
                          onSelect(c);
                          onSearch("");
                        }}
                        className="flex w-full items-center justify-between px-4 py-2 hover:bg-gray-50"
                      >
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {c.first_name} {c.last_name}
                          </p>
                          <p className="text-xs text-gray-500">{c.phone}</p>
                        </div>
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">
                          Select
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center">
                  <p className="text-sm text-gray-500">No customer found</p>
                  <button
                    onClick={onQuickAdd}
                    disabled={search.length < 10}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-md bg-gray-900 py-2 text-xs font-medium text-white"
                  >
                    <Plus className="h-3 w-3" />
                    Quick Create for "{search}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
