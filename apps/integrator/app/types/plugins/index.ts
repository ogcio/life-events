export type FormPluginData = {
  url: string;
  title: string;
};

export type PaymentPluginData = {
  url: string;
  title: string;
};

export type MessagingPluginData = {};

export type PluginData =
  | FormPluginData
  | PaymentPluginData
  | MessagingPluginData;

export type FormSubmissionData = {
  success: boolean;
};

export type PaymentSubmissionData = {
  success: boolean;
};

export type MessagingSubmissionData = {
  success: boolean;
};

export type SubmissionData =
  | FormSubmissionData
  | PaymentSubmissionData
  | MessagingSubmissionData;
