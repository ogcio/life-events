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
