import { sdk } from "@/lib/sdk";
import { useDebounce } from "@/lib/useDebounce";
import type { HttpTypes } from "@medusajs/types";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export function usePOSData() {
  const [productSearch, setProductSearch] = useState("");
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const debouncedProductSearch = useDebounce(productSearch, 300);
  const debouncedCustomerSearch = useDebounce(customerSearch, 400);

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["admin-products", debouncedProductSearch, selectedCategory],
    queryFn: async () => {
      const params: HttpTypes.AdminProductListParams = {
        limit: 50,
        fields: "id,title,thumbnail,*variants,*variants.prices",
        q: debouncedProductSearch || undefined,
        category_id: selectedCategory ? [selectedCategory] : undefined,
      };

      const response = await sdk.admin.product.list(params);
      return response.products;
    },
  });

  const { data: categories = [], isLoading: categoriesLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const params: HttpTypes.AdminProductCategoryListParams = {
        limit: 50,
        fields: "id,name,handle",
      };

      const response = await sdk.admin.productCategory.list(params);
      return response.product_categories;
    },
  });

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ["admin-customers", debouncedCustomerSearch],
    queryFn: async () => {
      if (debouncedCustomerSearch.length < 2) return [];
      const response = await sdk.admin.customer.list({
        q: debouncedCustomerSearch,
        limit: 10,
      });

      return response.customers;
    },
  });

  return {
    products,
    categories,
    customers,
    isLoading: productsLoading || categoriesLoading,
    filters: {
      productSearch,
      customerSearch,
      selectedCategory,
    },
    actions: {
      setProductSearch,
      setSelectedCategory,
      setCustomerSearch,
      clearFilters: () => {
        setProductSearch("");
        setSelectedCategory(null);
      },
    },
  };
}
