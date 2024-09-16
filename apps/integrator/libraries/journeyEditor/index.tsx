import { FlowStep, Journey, JourneyWidgetProps } from "./types";
import { WidgetManager } from "./widgets";
import { JourneyWidget } from "./widgets/baseWidget";
export class JourneyEditor {
  private widgetManager: WidgetManager;
  private readonly journey: Journey;
  private steps: JourneyWidget[];
  private flow: FlowStep[];

  constructor(journey: Journey, flow: FlowStep[]) {
    this.widgetManager = new WidgetManager();
    this.flow = flow;

    this.journey = journey;
    this.initSteps();
  }

  private initSteps() {
    this.steps = this.flow.map((flowStep) => {
      const computedStepId = `${flowStep.type}-${flowStep.stepNumber}`;
      const existingStep =
        flowStep.type === "title"
          ? {
              id: this.journey.id,
              journeyId: this.journey.id,
              data: {
                name: this.journey.title,
              },
            }
          : this.journey.steps.find(
              (step) =>
                flowStep.type === step.type &&
                flowStep.stepNumber === step.stepNumber,
            );

      const journeyStep: JourneyWidgetProps = {
        id: computedStepId,
        stepId: existingStep?.id,
        journeyId: this.journey.id,
        data: existingStep?.data ?? {},
        required: flowStep.required,
        stepNumber: flowStep.stepNumber,
      };

      const widget = this.widgetManager.getWidget(flowStep.type);
      return new widget(journeyStep);
    });
  }

  getStepsInfo() {
    return this.steps
      .map((step) => step.getInfo())
      .sort((a, b) => (a.stepNumber < b.stepNumber ? -1 : 1));
  }

  getStep(id: string) {
    return this.steps.find((step) => step.getInfo().id === id);
  }

  setStepData(id: string, data: any) {
    this.steps.find((step) => step.getInfo().id === id)?.setData(data);
  }

  isCompleted() {
    return this.steps
      .filter((step) => step.getInfo().required)
      .every((step) => step.isCompleted());
  }
}
