import { getUserInfoById } from "auth/sessions";
import { pgpool } from "../../../dbConnection";
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
