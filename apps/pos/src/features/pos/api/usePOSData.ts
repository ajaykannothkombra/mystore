import { sdk } from "@/lib/sdk";
import { useDebounce } from "@/lib/useDebounce";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const queryProductVariants = (q: string, limit: number = 20) =>
  sdk.admin.productVariant.list({
    limit,
    q,
    fields: "barcode,sku,title,*product,*prices", // TODO: review this list of fields
  });

export function usePOSData() {
  const [productSearch, setProductSearch] = useState("");
  // const [customerSearch, setCustomerSearch] = useState("");

  const debouncedProductSearch = useDebounce(productSearch, 300);
  // const debouncedCustomerSearch = useDebounce(customerSearch, 400);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ["admin-product-variants", debouncedProductSearch],
    queryFn: async () => {
      if (!debouncedProductSearch) return [];

      const response = await queryProductVariants(debouncedProductSearch);
      return response.variants;
    },
    placeholderData: (prev) => prev,
    enabled: debouncedProductSearch.length > 1,
  });

  const handleBarcodeScan = async (search: string) => {
    const response = await queryProductVariants(search, 5);

    const variant = response.variants?.[0];

    if (variant) return variant;

    return null;
  };

  // const { data: customers = [], isLoading: customersLoading } = useQuery({
  //   queryKey: ["admin-customers", debouncedCustomerSearch],
  //   queryFn: async () => {
  //     if (debouncedCustomerSearch.length < 2) return [];
  //     const response = await sdk.admin.customer.list({
  //       q: debouncedCustomerSearch,
  //       limit: 10,
  //     });

  //     return response.customers;
  //   },
  // });

  return {
    products,
    // customers,
    isLoading,
    filters: {
      productSearch,
      // customerSearch,
    },
    actions: {
      setProductSearch,
      handleBarcodeScan,
      // setCustomerSearch,
      clearFilters: () => {
        setProductSearch("");
      },
    },
  };
}
