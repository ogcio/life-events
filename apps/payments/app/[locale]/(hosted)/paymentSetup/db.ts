import { PaymentRequestDO } from "../../../../types/common";
import { ProviderType } from "./providers/types";

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
    type: ProviderType;
    id: string;
  }[];
};
