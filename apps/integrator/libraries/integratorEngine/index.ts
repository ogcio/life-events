import { Pool } from "pg";
import {
  Journey,
  JourneyStep,
  STEP_STATUS,
  Submission,
  SubmissionStep,
} from "../../app/types";
import { IntegratorPluginManager } from "./plugins";
import { insertNewSubmissionStep } from "../../app/utils/submissions";
import { IntegratorPlugin } from "./plugins/basePlugin";

export class IntegratorEngine {
  private submission: Submission;
  private journey: Journey;
  private journeySteps: JourneyStep[];
  private submissionSteps: SubmissionStep[];

  private pluginManager: IntegratorPluginManager;
  private pgpool: Pool;

  constructor(
    pgpool: Pool,
    submission: Submission,
    journey: Journey,
    submissionSteps: SubmissionStep[],
  ) {
    this.pgpool = pgpool;
    this.pluginManager = new IntegratorPluginManager();

    this.submission = submission;
    this.journey = journey;
    this.submissionSteps = submissionSteps;

    this.prepareJourneySteps();
  }

  private prepareJourneySteps() {
    this.journeySteps = [];
    const stepsMap: Record<string, JourneyStep> = this.journey.steps.reduce(
      (acc, step) => {
        acc[step.id] = step;
        return acc;
      },
      {},
    );
    const connectionMap: Record<string, string> =
      this.journey.connections.reduce((acc, connection) => {
        acc[connection.sourceStepId] = connection.destinationStepId;
        return acc;
      }, {});

    let stepId = this.journey.initialStepId;
    this.journeySteps.push(stepsMap[stepId]);

    while (connectionMap[stepId]) {
      this.journeySteps.push(stepsMap[connectionMap[stepId]]);
      stepId = connectionMap[stepId];
    }
  }

  public async execute(userId: string) {
    for (const step of this.journeySteps) {
      let currentSubmissionStep = this.submissionSteps.find(
        ({ stepId }) => stepId === step.id,
      );

      if (!currentSubmissionStep) {
        currentSubmissionStep = await this.createSubmissionStep(step.id);
      }

      const plugin = this.pluginManager.getPlugin(
        this.pgpool,
        step,
        currentSubmissionStep,
      );

      await this.executeStep(plugin, userId);
    }
  }

  public async completeStep(
    currentStepId: string,
    data: Record<string, string>,
    userId: string,
  ) {
    const step = this.journeySteps.find(({ id }) => id === currentStepId);

    if (!step) {
      throw new Error("Journey step not found");
    }

    const userSubmissionStepData = this.submissionSteps.find(
      ({ stepId }) => stepId === currentStepId,
    );

    if (!userSubmissionStepData) {
      throw new Error("Journey not found");
    }

    const plugin = this.pluginManager.getPlugin(
      this.pgpool,
      step,
      userSubmissionStepData,
    );

    await plugin.completeStep(data, userId);
  }

  private async createSubmissionStep(stepId: string) {
    const result = await insertNewSubmissionStep(
      this.pgpool,
      this.submission.id,
      stepId,
    );

    if (result.rowCount === 0) {
      throw new Error("Something went wrong");
    }

    return result.rows[0];
  }

  private executeStep(plugin: IntegratorPlugin, userId: string) {
    switch (plugin.getStatus()) {
      case STEP_STATUS.COMPLETED: {
        // if this step is completed, move to next
        // check if needed to retrieve data

        return Promise.resolve();
      }
      case STEP_STATUS.FAILED: {
        // todo
      }
      case STEP_STATUS.IN_PROGRESS: {
        // todo - should do nothing ???
      }
      case STEP_STATUS.PENDING: {
        // execute the step

        return plugin.execute(userId);
      }
    }
  }
}
