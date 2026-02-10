import { sdk } from "@/lib/sdk";
import { phoneToEmail } from "@/lib/utils";

export function useCustomerActions() {
  const createPhoneCustomer = async (phone: string, firstName?: string) => {
    try {
      const dummyEmail = phoneToEmail(phone);

      const response = await sdk.admin.customer.create({
        email: dummyEmail,
        phone: phone,
        first_name: firstName || "Guest",
      });

      return response.customer;
    } catch (error) {
      console.error("Customer creation failed", error);
      throw error;
    }
  };

  return { createPhoneCustomer };
}
