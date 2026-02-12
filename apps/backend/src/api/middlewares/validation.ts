import {
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { z } from "@medusajs/framework/zod";
import { createFindParams } from "@medusajs/medusa/api/utils/validators";

export const validateCreateStoreSchema = validateAndTransformBody(
  z.object({
    store_name: z.string(),
    phone: z
      .string()
      .regex(/^\d{10}/, "Phone number must be numeric and 10 digits long"),
  }),
);

export const validateGetStoresSchema = validateAndTransformQuery(
  createFindParams().extend({ user_id: z.string().optional() }),
  {
    defaults: ["user.email", "store.name"],
    isList: true,
  },
);
