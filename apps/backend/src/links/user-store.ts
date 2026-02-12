import { defineLink } from "@medusajs/framework/utils";
import UserModule from "@medusajs/medusa/user";
import StoreModule from "@medusajs/medusa/store";

export default defineLink(
  { linkable: UserModule.linkable.user, isList: true },
  { linkable: StoreModule.linkable.store, isList: true, deleteCascade: true },
);
