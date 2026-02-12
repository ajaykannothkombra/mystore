import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";

type CreateOrFetchUserAndStoreInput = {
  userId: string | null;
  phone: string;
  storeName: string;
  resolvedEmail: string;
};

const createOrFetchUserAndStoreStep = createStep(
  "create-or-fetch-user-and-store",
  async (input: CreateOrFetchUserAndStoreInput, { container }) => {
    const userModule = container.resolve(Modules.USER);
    const storeModule = container.resolve(Modules.STORE);
    const authModule = container.resolve(Modules.AUTH);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    let userId = input.userId;
    let isNewUser = false;
    let authIdentityId: string | null = null;

    if (!userId) {
      const user = await userModule.createUsers([
        {
          email: input.resolvedEmail,
        },
      ]);

      userId = user[0].id;
      isNewUser = true;

      const authIdentity = await authModule.createAuthIdentities([
        {
          provider_identities: [
            {
              provider: "emailpass",
              entity_id: input.resolvedEmail,
              provider_metadata: {
                password: "supersecret",
              },
            },
          ],
          app_metadata: {
            user_id: userId,
          },
        },
      ]);

      authIdentityId = authIdentity[0].id;
    }

    const [store] = await storeModule.createStores([{ name: input.storeName }]);

    // link the user to the store
    await link.create({
      [Modules.USER]: { user_id: userId },
      [Modules.STORE]: { store_id: store.id },
    });

    return new StepResponse(
      { userId, phone: input.phone, storeId: store.id },
      {
        userId,
        storeId: store.id,
        authIdentityId,
        isNewUser,
      },
    );
  },
  async (compensationData, { container }) => {
    if (!compensationData) return;

    const userModule = container.resolve(Modules.USER);
    const storeModule = container.resolve(Modules.STORE);
    const authModule = container.resolve(Modules.AUTH);
    const link = container.resolve(ContainerRegistrationKeys.LINK);

    // Rollback store & link
    await link.dismiss({
      [Modules.USER]: { user_id: compensationData.userId },
      [Modules.STORE]: { store_id: compensationData.storeId },
    });
    await storeModule.deleteStores([compensationData.storeId]);

    // rollback new user & auth identity
    if (compensationData.isNewUser) {
      if (compensationData.authIdentityId) {
        await authModule.deleteAuthIdentities([
          compensationData.authIdentityId,
        ]);
      }
      await userModule.deleteUsers([compensationData.userId]);
    }
  },
);

export default createOrFetchUserAndStoreStep;
