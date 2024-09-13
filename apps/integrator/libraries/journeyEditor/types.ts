export type JourneyWidgetInfo = {
  id: string;
  name: string;
  title?: string;
  required: boolean;
  stepNumber: number;
  stepId?: number;
  completed: boolean;
  actionTitle: string;
};

export enum JourneyStatus {
  CREATED = "created",
  COMPLETED = "completed",
}

export type FlowStep = {
  type: string;
  required: boolean;
  stepNumber: number;
};

export type JourneyStep = {
  id: number;
  type: string;
  stepNumber: number;
  data: any;
};

export type Journey = {
  id: number;
  title: string;
  steps: JourneyStep[];
  status: JourneyStatus;
};

export type JourneyWidgetProps = {
  id: string;
  stepId?: number;
  journeyId: number;
  data: any;
  stepNumber: number;
  required: boolean;
};

export type TitleWidgetProps = Omit<JourneyWidgetProps, "data"> & {
  data: {
    name: string | undefined;
  };
};

export type FormWidgetProps = Omit<JourneyWidgetProps, "data"> & {
  data: {
    title: string | undefined;
    url: string | undefined;
  };
};

export type PaymentWidgetProps = Omit<JourneyWidgetProps, "data"> & {
  data: {
    title: string | undefined;
    url: string | undefined;
  };
};

export type MessagingWidgetProps = Omit<JourneyWidgetProps, "data"> & {
  data: {
    title: string | undefined;
    url: string | undefined;
  };
};
