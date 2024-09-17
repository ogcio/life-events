export type JourneyWidgetInfo = {
  id: string;
  name: string;
  title?: string;
  required: boolean;
  stepNumber: number;
  stepId?: string;
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
  id: string;
  type: string;
  stepNumber: number;
  data: any;
};

export type Journey = {
  id: string;
  title: string;
  steps: JourneyStep[];
  status: JourneyStatus;
};

export type JourneyInfo = {
  id: string;
  title: string;
  status: JourneyStatus;
  createdAt: string;
  updatedAt: string;
};

export type JourneyWidgetProps = {
  id: string;
  stepId?: string;
  journeyId: string;
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
