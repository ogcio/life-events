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
