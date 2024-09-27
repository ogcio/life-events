import { PluginData } from "./plugins";

export type Journey = {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
};

export enum STEP_TYPE {
  FORM = "form",
  PAYMENT = "payment",
  MESSAGING = "messaging",
}

export enum STEP_STATUS {
  PENDING = "pending",
  IN_PROGRESS = "in_prgress",
  COMPLETED = "completed",
  FAILED = "failed",
}

export type JourneyStep = {
  id: string;
  journeyId: string;
  stepType: STEP_TYPE;
  stepNumber: number;
  stepData: PluginData;
  createdAt: Date;
  updatedAt: Date;
};

export type SubmissionStep = {
  id: string;
  submissionId: string;
  stepId: string;
  data: { [key: string]: string | number | boolean };
  status: STEP_STATUS;
  createdAt: Date;
  updatedAt: Date;
};

export type Submission = {
  id: string;
  userId: string;
  journeyId: string;
  createdAt: Date;
  updatedAt: Date;
};
