import { Provider } from "../app/[locale]/(hosted)/paymentSetup/providers/types";

export type NextPageProps = {
  params: { event: string; action: string[]; locale: string };
  searchParams?: {
    [key: string]: string;
  };
};

export type PaymentRequestDO = {
  paymentRequestId: string;
  userId: string;
  title: string;
  description: string;
  provider_id: string;
  reference: string;
  amount: number;
  status: string;
  redirectUrl: string;
  allowAmountOverride: boolean;
  allowCustomAmount: boolean;
};

export type PaymentRequest = {
  paymentRequestId: string;
  title: string;
  description: string;
  amount: number;
  reference: string;
  providers: ProviderWithUnknownData[];
  redirectUrl: string;
  allowAmountOverride: boolean;
  allowCustomAmount: boolean;
};

type ProviderWithUnknownData = {
  [K in keyof Provider]: K extends "data" ? unknown : Provider[K];
};
