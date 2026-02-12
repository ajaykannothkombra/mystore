import { MedusaRequest, MedusaResponse } from "@medusajs/framework";
import { provisionStoreWorkflow } from "../../../../workflows/store-management/provision-store";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { lookupPhone } from "../../../../utils";

export async function POST(req: MedusaRequest, res: MedusaResponse) {
  const { store_name, phone } = req.body as {
    store_name: string;
    phone: string;
  };

  const { result, errors } = await provisionStoreWorkflow(req.scope).run({
    input: {
      storeName: store_name,
      phone,
    },
  });

  if (errors.length) {
    return res.status(400).json({
      message: errors[0].error.message,
    });
  }

  res.status(201).json({
    message: "Store provisioned successfully",
    store: {
      user_id: result.userId,
      phone: result.phone,
      store_id: result.storeId,
      store_name,
    },
  });
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const { data, metadata } = await query.graph({
    entity: "user_store",
    ...req.queryConfig,
    filters: req.query.user_id
      ? {
          user_id: req.query.user_id as string,
        }
      : {},
  });

  res.json({
    stores: data.map((entry) => ({
      user_id: entry.user_id,
      phone: lookupPhone(entry.user?.email!),
      store_id: entry.store_id,
      store_name: entry.store?.name,
    })),
    count: metadata?.count,
    offset: metadata?.skip,
    limit: metadata?.take,
  });
}
