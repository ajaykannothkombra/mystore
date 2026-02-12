import {
  createWorkflow,
  WorkflowResponse,
} from "@medusajs/framework/workflows-sdk";
import resolveAndValidateStep from "./steps/resolve-and-validate";
import createOrFetchUserAndStoreStep from "./steps/create-or-fetch-user-and-store";

export type ProvisionStoreWorkflowInput = {
  storeName: string;
  phone: string;
};

export const provisionStoreWorkflow = createWorkflow(
  "provision-store",
  function (input: ProvisionStoreWorkflowInput) {
    const validationResponse = resolveAndValidateStep(input);

    const userAndStoreStepResponse =
      createOrFetchUserAndStoreStep(validationResponse);

    return new WorkflowResponse(userAndStoreStepResponse);
  },
);
