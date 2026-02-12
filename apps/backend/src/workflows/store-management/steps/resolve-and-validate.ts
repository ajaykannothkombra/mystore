import {
  ContainerRegistrationKeys,
  MedusaError,
  ModuleRegistrationName,
} from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { lookupEmail } from "../../../utils";

type ResolveAndValidateInput = {
  storeName: string;
  phone: string;
};

const resolveAndValidateStep = createStep(
  "resolve-and-validate",
  async (input: ResolveAndValidateInput, { container }) => {
    const userModule = container.resolve(ModuleRegistrationName.USER);
    const userEmail = lookupEmail(input.phone);

    if (!userEmail) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Phone is required",
      );
    }

    const [user] = await userModule.listUsers({ email: userEmail });

    if (user) {
      const query = container.resolve(ContainerRegistrationKeys.QUERY);

      const { data } = await query.graph({
        entity: "user_store",
        fields: ["store.*"],
        filters: {
          user_id: user.id,
        },
      });

      const hasDuplicate = data.find(
        (entry) => entry.store?.name === input.storeName,
      );

      if (hasDuplicate) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `User already has a store named "${input.storeName}". Please choose a different name.`,
        );
      }

      return new StepResponse({
        userId: user?.id || null,
        phone: input.phone,
        resolvedEmail: userEmail,
        storeName: input.storeName,
      });
    }

    return new StepResponse({
      userId: null,
      phone: input.phone,
      resolvedEmail: userEmail,
      storeName: input.storeName,
    });
  },
);

export default resolveAndValidateStep;
