import { defineMiddlewares } from "@medusajs/framework";
import enforceAllowList from "./middlewares/enforce-allow-list";

const CASHIER_ALLOWED_ROUTES = [
  // Auth and session
  "/admin/users/me",
  "/admin/auth*",
  "/admin/stores*",

  // Orders - full access for processing
  "/admin/orders*",
  "/admin/draft-orders*",

  // Products - view and manage inventory
  "/admin/products*",
  "/admin/inventory-items*",
  "/admin/reservations*",
  "/admin/stock-locations*",

  // Customers - view and basic management
  "/admin/customers*",
  "/admin/customer-groups*",

  // Pricing and promotions - view only (write blocked below)
  "/admin/price-lists*",
  "/admin/promotions*",
  "/admin/campaigns*",

  // Fulfillment
  "/admin/fulfillments*",
  "/admin/fulfillment-sets*",
  "/admin/fulfillment-providers*",
  "/admin/shipping-options*",
  "/admin/shipping-profiles*",

  // Product organization
  "/admin/collections*",
  "/admin/categories*",
  "/admin/product-categories*",
  "/admin/product-types*",
  "/admin/product-tags*",
  "/admin/product-variants*",

  // Regions and currencies (view only needed for context)
  "/admin/regions*",
  "/admin/currencies*",

  // Sales channels
  "/admin/sales-channels*",

  // Returns and exchanges
  "/admin/returns*",
  "/admin/return-reasons*",
  "/admin/exchanges*",
  "/admin/claims*",

  // Payments
  "/admin/payments*",
  "/admin/refund-reasons*",

  // Notifications
  "/admin/notifications*",

  // Tax (view)
  "/admin/tax-regions*",
  "/admin/tax-rates*",

  // Uploads
  "/admin/uploads*",
];

const CASHIER_READ_ONLY_ROUTES = [
  "/admin/price-lists*",
  "/admin/promotions*",
  "/admin/campaigns*",
];

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin*",
      middlewares: [
        enforceAllowList(
          ["cashier"],
          CASHIER_ALLOWED_ROUTES,
          CASHIER_READ_ONLY_ROUTES,
        ),
      ],
    },
  ],
});
