import { Pool } from "pg";
import InputField from "../../app/components/InputField";
import {
  FlowStep,
  FormWidgetProps,
  Journey,
  JourneyWidgetInfo,
  JourneyWidgetProps,
  MessagingWidgetProps,
  PaymentWidgetProps,
  TitleWidgetProps,
} from "./types";

export const journeyFlow: FlowStep[] = [
  {
    type: "title",
    required: true,
    stepNumber: 1,
  },
  {
    type: "form",
    required: true,
    stepNumber: 2,
  },
  {
    type: "payment",
    required: false,
    stepNumber: 3,
  },
  {
    type: "messaging",
    required: false,
    stepNumber: 4,
  },
];

export class JourneyWidget {
  getInfo(): JourneyWidgetInfo {
    throw new Error("Method 'getInfo()' must be implemented.");
  }

  getData() {
    throw new Error("Method 'getData()' must be implemented.");
  }

  setData(data) {
    throw new Error("Method 'setData()' must be implemented.");
  }

  renderForm(t: (text: string) => string): JSX.Element {
    throw new Error("Method 'renderForm()' must be implemented.");
  }

  saveData(formData: FormData, pg: Pool) {
    throw new Error("Method 'saveData()' must be implemented.");
  }
}

export class TitleWidget extends JourneyWidget {
  private name = "Name";
  private data: TitleWidgetProps["data"] = {
    name: undefined,
  };
  private props: TitleWidgetProps;

  constructor(props: TitleWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.name,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: !!this.data.name,
      actionTitle: "edit",
    };
  }

  setData(data: TitleWidgetProps["data"]) {
    this.data.name = data.name;
  }

  getData() {
    return { ...this.data };
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("titleWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="name"
            label={t("titleWidget.nameLabel")}
            type="text"
            defaultValue={this.data.name}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const name = formData.get("name") as string;

    return pg.query(
      `
                UPDATE journeys
                SET title = $1
                WHERE id = $2;
            `,
      [name, this.props.stepId],
    );
  }
}

export class FormWidget extends JourneyWidget {
  private name = "Form";
  private data: FormWidgetProps["data"] = {
    title: undefined,
    url: undefined,
  };
  private props: FormWidgetProps;

  constructor(props: FormWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.title,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: !!this.data.title,
      actionTitle: "choose",
    };
  }

  setData(data: FormWidgetProps["data"]) {
    this.data.title = data.title;
    this.data.url = data.url;
  }

  getData() {
    return { ...this.data };
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("formWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="title"
            label={t("formWidget.titleLabel")}
            type="text"
            defaultValue={this.data.title}
          />
        </div>

        <div className="govie-form-group">
          <InputField
            name="url"
            label={t("formWidget.urlLabel")}
            type="text"
            defaultValue={this.data.url}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const stepData = {
      title: formData.get("title"),
      url: formData.get("url"),
    };

    if (this.props.stepId) {
      return pg.query(
        `
                    UPDATE journey_steps
                    SET step_data = $1, updated_at = now()::DATE
                    WHERE id = $2;
                `,
        [stepData, this.props.stepId],
      );
    } else {
      return pg.query(
        `
                    INSERT INTO journey_steps(
                        journey_id,
                        step_type,
                        step_number,
                        step_data,
                        created_at,
                        updated_at
                    )
                    VALUES ($1, $2, $3, $4, now()::DATE, now()::DATE)
                `,
        [this.props.journeyId, "form", this.props.stepNumber, stepData],
      );
    }
  }
}

export class PaymentWidget extends JourneyWidget {
  private name = "Payment";
  private data: PaymentWidgetProps["data"] = {
    title: undefined,
    url: undefined,
  };
  private props: PaymentWidgetProps;

  constructor(props: PaymentWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.title,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: !!this.data.title,
      actionTitle: "choose",
    };
  }

  setData(data: PaymentWidgetProps["data"]) {
    this.data.title = data.title;
    this.data.url = data.url;
  }

  getData() {
    return { ...this.data };
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("paymentWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="title"
            label={t("paymentWidget.titleLabel")}
            type="text"
            defaultValue={this.data.title}
          />
        </div>

        <div className="govie-form-group">
          <InputField
            name="url"
            label={t("paymentWidget.urlLabel")}
            type="text"
            defaultValue={this.data.url}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const stepData = {
      title: formData.get("title"),
      url: formData.get("url"),
    };

    if (this.props.stepId) {
      return pg.query(
        `
                    UPDATE journey_steps
                    SET step_data = $1, updated_at = now()::DATE
                    WHERE id = $2;
                `,
        [stepData, this.props.stepId],
      );
    } else {
      return pg.query(
        `
                    INSERT INTO journey_steps(
                        journey_id,
                        step_type,
                        step_number,
                        step_data,
                        created_at,
                        updated_at
                    )
                    VALUES ($1, $2, $3, $4, now()::DATE, now()::DATE)
                `,
        [this.props.journeyId, "payment", this.props.stepNumber, stepData],
      );
    }
  }
}

export class MessagingWidget extends JourneyWidget {
  private name = "Messaging";
  private data: MessagingWidgetProps["data"] = {
    title: undefined,
    url: undefined,
  };
  private props: MessagingWidgetProps;

  constructor(props: MessagingWidgetProps) {
    super();

    this.props = props;
    this.setData(props.data);
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.props.id,
      name: this.name,
      title: this.data.title,
      required: this.props.required,
      stepNumber: this.props.stepNumber,
      stepId: this.props.stepId,
      completed: !!this.data.title,
      actionTitle: "choose",
    };
  }

  setData(data: MessagingWidgetProps["data"]) {
    this.data.title = data.title;
    this.data.url = data.url;
  }

  renderForm(t: (text: string) => string): JSX.Element {
    return (
      <>
        <h2 className="govie-heading-m">{t("messagingWidget.title")}</h2>

        <div className="govie-form-group">
          <InputField
            name="title"
            label={t("messagingWidget.titleLabel")}
            type="text"
            defaultValue={this.data.title}
          />
        </div>

        <div className="govie-form-group">
          <InputField
            name="url"
            label={t("messagingWidget.urlLabel")}
            type="text"
            defaultValue={this.data.url}
          />
        </div>
      </>
    );
  }

  saveData(formData: FormData, pg: Pool) {
    const stepData = {
      title: formData.get("title"),
      url: formData.get("url"),
    };

    if (this.props.stepId) {
      return pg.query(
        `
                    UPDATE journey_steps
                    SET step_data = $1, updated_at = now()::DATE
                    WHERE id = $2;
                `,
        [stepData, this.props.stepId],
      );
    } else {
      return pg.query(
        `
                    INSERT INTO journey_steps(
                        journey_id,
                        step_type,
                        step_number,
                        step_data,
                        created_at,
                        updated_at
                    )
                    VALUES ($1, $2, $3, $4, now()::DATE, now()::DATE)
                `,
        [this.props.journeyId, "messaging", this.props.stepNumber, stepData],
      );
    }
  }
}

const journeyWidgetsMap = {
  title: TitleWidget,
  form: FormWidget,
  payment: PaymentWidget,
  messaging: MessagingWidget,
};
export class JourneyEditor {
  private readonly journey: Journey;
  private steps: JourneyWidget[];
  private flow: FlowStep[];

  constructor(journey: Journey, flow: FlowStep[]) {
    this.flow = flow;

    this.journey = journey;
    this.initSteps();
  }

  private initSteps() {
    this.steps = this.flow.map((flowStep) => {
      const computedStepId = `journey-${this.journey.id}-${flowStep.type}-${flowStep.stepNumber}`;
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

      if (!journeyWidgetsMap[flowStep.type]) {
        throw new Error("Widget not found!");
      }

      return new journeyWidgetsMap[flowStep.type](journeyStep);
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
}
