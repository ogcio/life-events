import { StepDataDO } from "../../../plugins/entities/journeySteps/types";

export type IntegratorProps = {
  journeyId: string;
  runId: string;
  host: string;
};

export interface IIntegratorPlugin {
  /**
   * Executes a Journey step and, as a result, returns a URL where the user
   * has to be redirected. If the step is an external service, then the URL will
   * be the service's URL, another way, if the task can be performed internally
   * and automatically returns the executor's complete step URL for the current
   * run instance.
   *
   * @param stepData
   */
  execute(
    stepData: StepDataDO,
    props?: IntegratorProps,
  ): Promise<{ url: string }>;

  /**
   * Allows processing of any incoming data and returns it in the requested
   * format to be saved in the step's submission.
   *
   * @param data
   */
  processResultData(data: any, props?: IntegratorProps): any;
}
