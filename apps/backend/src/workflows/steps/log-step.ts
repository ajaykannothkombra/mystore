import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import { createStep } from "@medusajs/framework/workflows-sdk";

export const logStep = createStep(
  "log-step",
  async (input: any, { container }) => {
    const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
    logger.info(`[Workflow Log]: ${JSON.stringify(input, null, 2)}`);
    return input;
  },
);
