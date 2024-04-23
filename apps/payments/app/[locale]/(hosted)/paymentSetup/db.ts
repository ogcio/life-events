import { PaymentRequestDO } from "../../../../types/common";

export type PaymentRequestDetails = Pick<
  PaymentRequestDO,
  | "paymentRequestId"
  | "title"
  | "description"
  | "amount"
  | "reference"
  | "redirectUrl"
  | "allowAmountOverride"
  | "allowCustomAmount"
> & {
  providers: {
    name: string;
    type: string;
    id: string;
  }[];
};
