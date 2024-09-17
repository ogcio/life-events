export type FormPluginData = {
  formsUrl: string;
  title: string;
};

export type PaymentPluginData = {
  paymentsUrl: string;
  title: string;
};

export type MessagingPluginData = {};

export type PluginData =
  | FormPluginData
  | PaymentPluginData
  | MessagingPluginData;
