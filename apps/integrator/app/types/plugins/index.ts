export type FormPluginData = {
  formsUrl: string;
};

export type PaymentPluginData = {};

export type MessagingPluginData = {};

export type PluginData =
  | FormPluginData
  | PaymentPluginData
  | MessagingPluginData;
