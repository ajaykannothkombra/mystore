import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import { deleteStoresWorkflow } from "@medusajs/medusa/core-flows";

export async function DELETE(req: MedusaRequest, res: MedusaResponse) {
  const storeModule = req.scope.resolve(Modules.STORE);
  const link = req.scope.resolve(ContainerRegistrationKeys.LINK);

  const store_id = req.params.id;

  // check the store exists
  // await storeModule.retrieveStore(store_id);

  // await link.delete({
  //   [Modules.STORE]: {
  //     store_id,
  //   },
  // });

  // await storeModule.deleteStores([store_id]);

  await deleteStoresWorkflow(req.scope).run({
    input: {
      ids: [store_id],
    },
  });

  res.sendStatus(204);
}
