import { JourneyStep, JourneyWidgetInfo } from "./types";

export const journeySteps: JourneyStep[] = [
  {
    type: "title",
    title: "Title",
    required: true,
  },
  // {
  //     type: 'form',
  //      title: 'Form',
  //     required: true
  // }
];
export class JourneyWidget {
  getInfo(): JourneyWidgetInfo {
    throw new Error("Method 'getInfo()' must be implemented.");
  }

  getConfig() {
    throw new Error("Method 'getConfig()' must be implemented.");
  }

  getData() {
    throw new Error("Method 'getData()' must be implemented.");
  }

  setData(data) {
    throw new Error("Method 'setData()' must be implemented.");
  }

  renderConfig(): JSX.Element {
    throw new Error("Method 'renderConfig()' must be implemented.");
  }
}

export class TitleWidget extends JourneyWidget {
  private readonly config = {
    title: {
      type: "string",
      label: "Title",
      required: true,
    },
  };
  private data = {
    title: undefined,
  };
  private id;
  private title;
  private required;

  constructor(props: { id: number; title: string; required: boolean }) {
    super();

    this.id = props.id;
    this.title = props.title;
    this.required = props.required;
  }

  getInfo(): JourneyWidgetInfo {
    return {
      id: this.id,
      title: this.title,
      require: this.required,
    };
  }

  getConfig() {
    return this.config;
  }

  setData(data) {
    this.data.title = data.title;
  }

  getData() {
    return { ...this.data };
  }

  renderConfig(): JSX.Element {
    return <h2 className="govie-heading-m"> TEST </h2>;
  }
}

export class JourneyEditor {
  private readonly journeyWidgetsMap = {
    title: TitleWidget,
  };

  private readonly journey: JourneyStep[];
  private steps: JourneyWidget[];

  constructor(journey: JourneyStep[]) {
    this.journey = journey;
    this.steps = this.journey.map(
      (step, index) =>
        new this.journeyWidgetsMap[step.type]({
          id: index,
          title: step.title,
          required: step.required,
        }),
    );
  }

  getSteps() {
    return this.steps.map((step) => step.getInfo());
  }

  getStep(id: string) {
    return this.steps.find((step) => step.getInfo().id === id);
  }

  setStepData(id: string, data: any) {
    this.steps.find((step) => step.getInfo().id === id)?.setData(data);
  }
}
