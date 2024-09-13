import { PluginData } from "./plugins";

export type Journey = {
  id: number;
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
  id: number;
  journeyId: number;
  stepType: STEP_TYPE;
  stepNumber: number;
  stepData: PluginData;
  createdAt: Date;
  updatedAt: Date;
};

export type SubmissionStep = {
  id: number;
  submissionId: number;
  stepId: number;
  data: { [key: string]: string | number | boolean };
  status: STEP_STATUS;
  createdAt: Date;
  updatedAt: Date;
};

export type Submission = {
  id: number;
  userId: string;
  journeyId: number;
  createdAt: Date;
  updatedAt: Date;
};
