import Medusa from "@medusajs/js-sdk";

const BACKEND_URL =
  import.meta.env.VITE_MEDUSA_BACKEND_URL || "http://localhost:9000";

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: import.meta.env.DEV,
  auth: {
    type: "session",
  },
});
