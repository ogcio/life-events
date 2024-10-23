import { FormStepDataDO } from "../../../plugins/entities/journeySteps/types";
import { IIntegratorPlugin, IntegratorProps } from "./basePlugin";
import { keyAlias } from "../../../utils/kms";
import { createSignedJWT } from "api-auth";

export class FormPlugin implements IIntegratorPlugin {
  public async execute(
    stepData: FormStepDataDO,
    props: IntegratorProps,
  ): Promise<{ url: string }> {
    const url = new URL(stepData.url);

    const redirectUrl = new URL(
      `/journey/${props.journeyId}/callback`,
      props.host,
    );
    url.searchParams.set("runId", props.runId);

    const jwt = await createSignedJWT(
      {
        runId: props.runId,
        journeyId: props.journeyId,
        redirectUrl,
      },
      keyAlias,
      {
        audience: "formsie-api",
        issuer: "integrator-api",
      },
    );

    url.searchParams.set("token", jwt);

    return { url: url.href };
  }

  public processResultData(data: any) {
    return data;
  }

  //TODO: To complete
  public getJwksUrl() {
    return "/.well-known/jwks.json";
  }
}
